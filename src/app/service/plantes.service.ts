import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, finalize, map, of, shareReplay, tap } from 'rxjs';
import { Type } from '../models/type.model';
import { Plante } from '../models/plante.model';

interface ProduitApi {
  idProduit?: number;
  nomProduit: string;
  prixProduit: number;
  dateCreation?: string | number;
}

@Injectable({ providedIn: 'root' })
export class PlantesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8090/produits/api';
  private readonly httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };
  readonly types: Type[] = [
    { id: 1, nom: 'Plantes d’intérieur' },
    { id: 2, nom: 'Succulentes' },
    { id: 3, nom: 'Plantes aromatiques' },
  ];
  private readonly typesStorageKey = 'mesPlantes.typesParId';
  private readonly plantesCacheKey = 'mesPlantes.plantesCache';
  private chargementEnCours?: Observable<Plante[]>;
  private dernierChargement = 0;
  readonly plantes = signal<Plante[]>(this.lirePlantesCache());

  charger(): Observable<Plante[]> {
    if (this.plantes().length > 0 && Date.now() - this.dernierChargement < 15_000) {
      return of(this.plantes());
    }
    if (this.chargementEnCours) return this.chargementEnCours;

    const requete = this.http.get<ProduitApi[]>(this.apiUrl).pipe(
      map((produits) => produits.map((produit) => this.depuisApi(produit))),
      tap((plantes) => {
        this.plantes.set(plantes);
        this.dernierChargement = Date.now();
        this.sauvegarderPlantesCache(plantes);
      }),
      finalize(() => { this.chargementEnCours = undefined; }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    this.chargementEnCours = requete;
    return requete;
  }

  listetypes(): Type[] {
    return this.types;
  }

  rechercherParType(idType: number): Observable<Plante[]> {
    return this.charger().pipe(
      map((plantes) => plantes.filter((plante) => plante.type.id === Number(idType))),
    );
  }

  rechercherParNom(nom: string): Observable<Plante[]> {
    const recherche = nom.trim().toLocaleLowerCase();
    return this.charger().pipe(
      map((plantes) => plantes.filter((plante) => plante.nom.toLocaleLowerCase().includes(recherche))),
    );
  }

  ajouter(nom: string, prix: number, dateCreation = new Date().toISOString(), typeId = 1): Observable<Plante> {
    return this.http.post<ProduitApi>(this.apiUrl, {
      nomProduit: nom.trim(),
      prixProduit: prix,
      dateCreation: new Date(`${dateCreation.slice(0, 10)}T00:00:00`).toISOString(),
    }, this.httpOptions).pipe(
      map((produit) => this.depuisApi(produit)),
      map((plante) => ({ ...plante, type: this.typeParId(typeId) })),
      tap((plante) => {
        this.enregistrerType(plante.id, typeId);
        this.plantes.update((plantes) => [...plantes, plante]);
        this.dernierChargement = Date.now();
        this.sauvegarderPlantesCache(this.plantes());
      }),
    );
  }

  modifier(plante: Plante): Observable<Plante> {
    return this.http.put<ProduitApi>(this.apiUrl, {
      idProduit: plante.id,
      nomProduit: plante.nom.trim(),
      prixProduit: plante.prix,
      dateCreation: plante.dateCreation,
    }, this.httpOptions).pipe(
      map((produit) => ({ ...this.depuisApi(produit), type: plante.type })),
      tap((planteModifiee) => this.plantes.update((plantes) =>
        plantes.map((element) => element.id === planteModifiee.id ? planteModifiee : element),
      )),
      tap((planteModifiee) => {
        this.enregistrerType(planteModifiee.id, plante.type.id);
        this.dernierChargement = Date.now();
        this.sauvegarderPlantesCache(this.plantes());
      }),
    );
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => {
        this.supprimerTypeEnregistre(id);
        this.plantes.update((plantes) => plantes.filter((plante) => plante.id !== id));
        this.dernierChargement = Date.now();
        this.sauvegarderPlantesCache(this.plantes());
      }),
    );
  }

  consulter(id: number): Observable<Plante> {
    return this.http.get<ProduitApi>(`${this.apiUrl}/${id}`).pipe(
      map((produit) => this.depuisApi(produit)),
    );
  }

  private depuisApi(produit: ProduitApi): Plante {
    const date = produit.dateCreation;
    const dateCreation = typeof date === 'number'
      ? new Date(date).toISOString()
      : date ?? new Date().toISOString();
    return {
      id: produit.idProduit ?? 0,
      nom: produit.nomProduit,
      prix: produit.prixProduit,
      dateCreation,
      type: this.typePourProduit(produit),
    };
  }

  private typeParId(id: number): Type {
    return this.types.find((type) => type.id === Number(id)) ?? this.types[0];
  }

  private typePourProduit(produit: ProduitApi): Type {
    const typeEnregistre = this.lireTypesEnregistres()[String(produit.idProduit)];
    if (typeEnregistre) return this.typeParId(typeEnregistre);

    return this.typeParId(this.typeIdSelonNom(produit.nomProduit));
  }

  private typeIdSelonNom(nom: string): number {
    const normalise = nom.toLocaleLowerCase();
    if (normalise.includes('aloe')) return 2;
    if (['basilic', 'romarin', 'menthe', 'lavande', 'thym'].some((mot) => normalise.includes(mot))) return 3;
    return 1;
  }

  private lirePlantesCache(): Plante[] {
    try {
      const valeur = localStorage.getItem(this.plantesCacheKey);
      const cache: unknown = valeur ? JSON.parse(valeur) : [];
      if (!Array.isArray(cache)) return [];
      return cache.filter((item): item is Plante =>
        item !== null && typeof item === 'object'
        && typeof item.id === 'number' && typeof item.nom === 'string'
        && typeof item.prix === 'number' && typeof item.dateCreation === 'string',
      ).map((plante) => ({
        ...plante,
        type: this.typeParId(plante.type?.id ?? this.typeIdSelonNom(plante.nom)),
      }));
    } catch {
      return [];
    }
  }

  private sauvegarderPlantesCache(plantes: Plante[]): void {
    try {
      localStorage.setItem(this.plantesCacheKey, JSON.stringify(plantes));
    } catch {
      // Le cache accélère l'affichage, mais son indisponibilité ne bloque pas l'API.
    }
  }

  private lireTypesEnregistres(): Record<string, number> {
    try {
      const valeur = localStorage.getItem(this.typesStorageKey);
      const resultat: unknown = valeur ? JSON.parse(valeur) : {};
      return resultat && typeof resultat === 'object' && !Array.isArray(resultat)
        ? resultat as Record<string, number>
        : {};
    } catch {
      return {};
    }
  }

  private enregistrerType(id: number, typeId: number): void {
    const types = this.lireTypesEnregistres();
    types[String(id)] = typeId;
    localStorage.setItem(this.typesStorageKey, JSON.stringify(types));
  }

  private supprimerTypeEnregistre(id: number): void {
    const types = this.lireTypesEnregistres();
    delete types[String(id)];
    localStorage.setItem(this.typesStorageKey, JSON.stringify(types));
  }
}
