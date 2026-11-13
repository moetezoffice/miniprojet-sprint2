import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Type } from '../models/type.model';
import { PlantesService } from '../service/plantes.service';

@Component({
  selector: 'app-add-plante',
  imports: [FormsModule, RouterLink],
  templateUrl: './add-plante.html',
  styleUrl: './add-plante.css',
})
export class AddPlante {
  protected nom = '';
  protected prix: number | null = null;
  protected dateCreation = new Date().toISOString().slice(0, 10);
  protected types: Type[];
  protected typeId = 1;
  protected erreur = '';

  private readonly plantesService = inject(PlantesService);
  private readonly router = inject(Router);

  constructor() {
    this.types = this.plantesService.listetypes();
  }

  protected ajouterPlante(): void {
    const nom = this.nom.trim();
    if (!nom || this.prix === null || this.prix < 0) return;

    this.plantesService.ajouter(nom, this.prix, this.dateCreation, this.typeId).subscribe({
      next: () => { void this.router.navigate(['/plantes']); },
      error: () => { this.erreur = 'Ajout impossible. Vérifiez le backend.'; },
    });
  }
}
