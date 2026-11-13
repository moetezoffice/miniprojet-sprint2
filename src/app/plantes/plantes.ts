import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Plante } from '../models/plante.model';
import { PlantesService } from '../service/plantes.service';

@Component({
  selector: 'app-plantes',
  imports: [DatePipe, RouterLink],
  templateUrl: './plantes.html',
  styleUrl: './plantes.css',
})
export class Plantes implements OnInit {
  protected readonly plantesService = inject(PlantesService);
  protected readonly authService = inject(AuthService);
  protected chargement = true;
  protected erreur = '';
  protected message = '';

  constructor() {
    this.chargement = this.plantesService.plantes().length === 0;
  }

  ngOnInit(): void {
    this.chargerPlantes();
  }

  protected chargerPlantes(): void {
    this.chargement = this.plantesService.plantes().length === 0;
    this.erreur = '';
    this.plantesService.charger().subscribe({
      next: () => { this.chargement = false; },
      error: () => {
        this.chargement = false;
        this.erreur = 'Impossible de joindre le serveur. Vérifiez MySQL et le backend.';
      },
    });
  }

  protected supprimerPlante(plante: Plante): void {
    if (!this.authService.isAdmin() || !confirm(`Supprimer ${plante.nom} ?`)) return;
    this.plantesService.supprimer(plante.id).subscribe({
      next: () => { this.message = 'Plante supprimée.'; this.erreur = ''; },
      error: () => { this.erreur = 'Suppression impossible. Vérifiez le backend.'; },
    });
  }
}
