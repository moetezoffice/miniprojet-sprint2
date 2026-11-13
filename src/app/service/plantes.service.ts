import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
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
  private readonly typeParDefaut: Type = { id: 1, nom: 'Plante' };
  readonly plantes = signal<Plante[]>([]);

  charger(): Observable<Plante[]> {
    return this.http.get<ProduitApi[]>(this.apiUrl).pipe(
      map((produits) => produits.map((produit) => this.depuisApi(produit))),
      tap((plantes) => this.plantes.set(plantes)),
    );
  }

  ajouter(nom: string, prix: number): Observable<Plante> {
    return this.http.post<ProduitApi>(this.apiUrl, {
      nomProduit: nom.trim(),
      prixProduit: prix,
      dateCreation: new Date().toISOString(),
    }, this.httpOptions).pipe(
      map((produit) => this.depuisApi(produit)),
      tap((plante) => this.plantes.update((plantes) => [...plantes, plante])),
    );
  }

  modifier(plante: Plante): Observable<Plante> {
    return this.http.put<ProduitApi>(this.apiUrl, {
      idProduit: plante.id,
      nomProduit: plante.nom.trim(),
      prixProduit: plante.prix,
      dateCreation: plante.dateCreation,
    }, this.httpOptions).pipe(
      map((produit) => this.depuisApi(produit)),
      tap((planteModifiee) => this.plantes.update((plantes) =>
        plantes.map((element) => element.id === planteModifiee.id ? planteModifiee : element),
      )),
    );
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => this.plantes.update((plantes) => plantes.filter((plante) => plante.id !== id))),
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
      type: this.typeParDefaut,
    };
  }
}
