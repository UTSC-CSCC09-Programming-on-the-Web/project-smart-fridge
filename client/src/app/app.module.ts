// src/app/app.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { IngredientListPageComponent } from './pages/main-page/ingredient-list-page/ingredient-list-page.component';
import { HeaderComponent } from './components/header/header.component';
import { IngredientFormComponent } from './components/ingredient-form/ingredient-form.component';
import { IngredientCardComponent } from './components/ingredient-card/ingredient-card.component';

import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    MainPageComponent,
    IngredientListPageComponent,
    HeaderComponent,
    IngredientFormComponent,
    IngredientCardComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
