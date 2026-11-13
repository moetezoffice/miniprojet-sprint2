import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Type } from '../models/type.model';
import { Plante } from '../models/plante.model';
import { PlantesService } from '../service/plantes.service';

@Component({
  selector: 'app-recherche-par-type',
  imports: [FormsModule, DatePipe],
  templateUrl: './recherche-par-type.html',
  styleUrl: './recherche-par-type.css',
})
export class RechercheParTypeComponent implements OnInit {
  protected types: Type[];
  protected plantes: Plante[] = [];
  protected idType: number | null = null;

  private readonly plantesService = inject(PlantesService);

  constructor() {
    this.types = this.plantesService.listetypes();
  }

  ngOnInit(): void {
    this.plantesService.charger().subscribe();
  }

  protected onChange(): void {
    if (this.idType === null) {
      this.plantes = [];
      return;
    }

    this.plantesService.rechercherParType(this.idType).subscribe((plantes) => {
      this.plantes = plantes;
    });
  }
}
