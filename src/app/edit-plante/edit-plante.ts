import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Type } from '../models/type.model';
import { Plante } from '../models/plante.model';
import { PlantesService } from '../service/plantes.service';

@Component({
  selector: 'app-edit-plante',
  imports: [FormsModule],
  templateUrl: './edit-plante.html',
  styleUrl: './edit-plante.css',
})
export class EditPlante {
  protected types: Type[];
  protected plante?: Plante;
  protected typeId = 1;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly plantesService = inject(PlantesService);

  constructor() {
    this.types = this.plantesService.listetypes();
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.plante = this.plantesService.consulterPlante(id);

    if (!this.plante) {
      void this.router.navigate(['/plantes']);
      return;
    }

    this.typeId = this.plante.type.id;
  }

  protected modifierPlante(): void {
    if (!this.plante) return;

    const type = this.plantesService.consultertype(this.typeId);
    const nom = this.plante.nom.trim();
    if (!type || !nom || !Number.isFinite(this.plante.prix) || this.plante.prix < 0 || !this.plante.dateCreation) return;

    this.plantesService.modifier({ ...this.plante, nom, type });
    void this.router.navigate(['/plantes']);
  }
}
