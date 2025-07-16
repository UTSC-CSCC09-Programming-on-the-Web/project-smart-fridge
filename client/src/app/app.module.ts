// src/app/app.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';

import { AppComponent } from './app.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { IngredientListPageComponent } from './pages/main-page/ingredient-list-page/ingredient-list-page.component';
import { RecipePageComponent } from './pages/main-page/recipe-page/recipe-page.component';
import { HeaderComponent } from './components/header/header.component';
import { IngredientFormComponent } from './components/ingredient-form/ingredient-form.component';
import { IngredientCardComponent } from './components/ingredient-card/ingredient-card.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { RecipeCardComponent } from './components/recipe-card/recipe-card.component';
import { RecipeFormComponent } from './components/recipe-form/recipe-form.component';
import { IngredientInputPageComponent } from './pages/main-page/ingredient-input-page/ingredient-input-page.component';
import { AppRoutingModule } from './app-routing.module';
import { MultiImageUploadComponent } from './components/multi-image-upload/multi-image-upload.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    MainPageComponent,
    IngredientListPageComponent,
    HeaderComponent,
    IngredientFormComponent,
    IngredientCardComponent,
    ConfirmDialogComponent,
    RecipePageComponent,
    RecipeCardComponent,
    RecipeFormComponent,
    IngredientInputPageComponent,
    MultiImageUploadComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,
    MatDialogModule,
    MatButtonModule,
    InfiniteScrollDirective,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
