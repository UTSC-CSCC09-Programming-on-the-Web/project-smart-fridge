// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginPageComponent } from './pages/login-page/login-page.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { IngredientListPageComponent } from './pages/main-page/ingredient-list-page/ingredient-list-page.component';

const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: '', component: MainPageComponent, children: [
    // alpha version implementation
     { path: '', redirectTo: 'ingredients', pathMatch: 'full' },
     { path: 'ingredients', component: IngredientListPageComponent } // Default route for main page
  ]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

