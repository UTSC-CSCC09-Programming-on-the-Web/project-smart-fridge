// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginPageComponent } from './pages/login-page/login-page.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { IngredientListPageComponent } from './pages/main-page/ingredient-list-page/ingredient-list-page.component';
import { GoogleSuccessPageComponent } from './pages/login-page/google-success-page/google-success-page.component';
import { GoogleFailurePageComponent } from './pages/login-page/google-failure-page/google-failure-page.component';
import { SubscribePageComponent } from './pages/login-page/subscribe-page/subscribe-page';
import { FristLoginComponent } from './pages/login-page/frist-login/frist-login.component';
import { CreditPageComponent } from './pages/credit-page/credit-page.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // default route to redirect to login page
  { path: 'login', component: LoginPageComponent },
  { path: 'subscribe', component: SubscribePageComponent },
  { path: 'auth/google/success', component: GoogleSuccessPageComponent },
  { path: 'auth/google/failure', component: GoogleFailurePageComponent },
  { path: 'first-login', component: FristLoginComponent },
  {
    path: 'main',
    component: MainPageComponent,
    children: [
      { path: '', redirectTo: 'ingredients', pathMatch: 'full' }, // default route for main page
      { path: 'ingredients', component: IngredientListPageComponent },
    ],
  },
  { path: 'credits', component: CreditPageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)], 
  exports: [RouterModule],
})
export class AppRoutingModule {}
