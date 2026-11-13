import { Routes } from '@angular/router';
import { Plantes } from './plantes/plantes';
import { AddPlante } from './add-plante/add-plante';
import { EditPlante } from './edit-plante/edit-plante';
import { RechercheParTypeComponent } from './recherche-par-type/recherche-par-type';
import { RechercheParNomComponent } from './recherche-par-nom/recherche-par-nom';

export const routes: Routes = [
  { path: 'plantes', component: Plantes },
  { path: 'add-plante', component: AddPlante },
  { path: 'edit-plante/:id', component: EditPlante },
  { path: 'rechercheParType', component: RechercheParTypeComponent },
  { path: 'rechercheParNom', component: RechercheParNomComponent },
  { path: '', redirectTo: 'plantes', pathMatch: 'full' },
  { path: '**', redirectTo: 'plantes' },
];
