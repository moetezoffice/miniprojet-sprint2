import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Plante } from './models/plante.model';
import { PlantesService } from './service/plantes.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly service = inject(PlantesService);
  protected nom = '';
  protected prix: number | null = null;
  protected recherche = '';
  protected planteEnEdition?: Plante;
  protected chargement = true;
  protected message = '';
  protected erreur = '';

  ngOnInit(): void {
    this.service.charger().subscribe({
      next: () => { this.chargement = false; },
      error: () => {
        this.chargement = false;
        this.erreur = 'Impossible de joindre le serveur. Vérifiez MySQL et le backend.';
      },
    });
  }

  protected get plantesFiltrees(): Plante[] {
    const recherche = this.recherche.trim().toLocaleLowerCase();
    return this.service.plantes().filter((plante) => plante.nom.toLocaleLowerCase().includes(recherche));
  }

  protected enregistrer(): void {
    const nom = this.nom.trim();
    if (!nom || this.prix === null || this.prix < 0) return;

    const requete = this.planteEnEdition
      ? this.service.modifier({ ...this.planteEnEdition, nom, prix: this.prix })
      : this.service.ajouter(nom, this.prix);
    requete.subscribe({
      next: () => {
        this.message = this.planteEnEdition ? 'Plante modifiée.' : 'Plante ajoutée.';
        this.annulerEdition();
        this.erreur = '';
      },
      error: () => { this.erreur = 'Enregistrement impossible. Vérifiez le backend.'; },
    });
  }

  protected editer(plante: Plante): void {
    this.service.consulter(plante.id).subscribe({
      next: (planteConsultee) => {
        this.planteEnEdition = planteConsultee;
        this.nom = planteConsultee.nom;
        this.prix = planteConsultee.prix;
        this.message = '';
        this.erreur = '';
      },
      error: () => { this.erreur = 'Consultation impossible. Vérifiez le backend.'; },
    });
  }

  protected supprimer(plante: Plante): void {
    if (!confirm(`Supprimer ${plante.nom} ?`)) return;
    this.service.supprimer(plante.id).subscribe({
      next: () => { this.message = 'Plante supprimée.'; this.erreur = ''; },
      error: () => { this.erreur = 'Suppression impossible. Vérifiez le backend.'; },
    });
  }

  protected annulerEdition(): void {
    this.planteEnEdition = undefined;
    this.nom = '';
    this.prix = null;
  }
}
