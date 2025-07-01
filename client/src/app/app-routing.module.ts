// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginPageComponent } from './pages/login-page/login-page.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { IngredientListPageComponent } from './pages/main-page/ingredient-list-page/ingredient-list-page.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // default route to redirect to login page
  { path: 'login', component: LoginPageComponent },
  {
    path: 'main',
    component: MainPageComponent,
    children: [
      // alpha version implementation
      { path: '', redirectTo: 'ingredients', pathMatch: 'full' }, // default route for main page
      { path: 'ingredients', component: IngredientListPageComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
