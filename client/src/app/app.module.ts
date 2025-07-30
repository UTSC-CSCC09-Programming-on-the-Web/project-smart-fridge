// src/app/app.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { IngredientListPageComponent } from './pages/main-page/ingredient-list-page/ingredient-list-page.component';
import { RecipePageComponent } from './pages/main-page/recipe-page/recipe-page.component';
import { IngredientFormComponent } from './components/ingredient-form/ingredient-form.component';
import { IngredientCardComponent } from './components/ingredient-card/ingredient-card.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { RecipeCardComponent } from './components/recipe-card/recipe-card.component';
import { RecipeFormComponent } from './components/recipe-form/recipe-form.component';
import { IngredientInputPageComponent } from './pages/main-page/ingredient-input-page/ingredient-input-page.component';
import { AppRoutingModule } from './app-routing.module';
import { MultiImageUploadComponent } from './components/multi-image-upload/multi-image-upload.component';
import { NotificationBarComponent } from './components/notification-bar/notification-bar.component';
import { NewFridgeFormComponent } from './components/new-fridge-form/new-fridge-form.component';
import { FristLoginComponent } from './pages/login-page/frist-login/frist-login.component';
import { FridgeSelectorComponent } from './components/fridge-selector/fridge-selector.component';
import { NotificationInfoCenterComponent } from './components/notification-info-center/notification-info-center.component';
import { InfoNotificationPageComponent } from './pages/main-page/info-notification-page/info-notification-page.component';
import { AddiFeaturePageComponent } from './pages/main-page/addi-feature-page/addi-feature-page.component';
import { TempIngredientsListComponent } from './pages/main-page/ingredient-input-page/temp-ingredients-list/temp-ingredients-list.component';
import { OverlayModelComponent } from './pages/main-page/overlay-model/overlay-model.component';
import { TimeAgoPipe } from './pipes/time-ago.pipe';
import { MaterialModule } from './material.module';
import { TaskLoadingNotificationComponent } from './components/task-loading-notification/task-loading-notification.component';
import { CreditPageComponent } from './pages/credit-page/credit-page.component';
import { ToggleContainerComponent } from './components/toggle-container/toggle-container.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    FristLoginComponent,
    MainPageComponent,
    IngredientListPageComponent,
    IngredientFormComponent,
    IngredientCardComponent,
    ConfirmDialogComponent,
    RecipePageComponent,
    RecipeCardComponent,
    RecipeFormComponent,
    IngredientInputPageComponent,
    MultiImageUploadComponent,
    NotificationBarComponent,
    NewFridgeFormComponent,
    FridgeSelectorComponent,
    NotificationInfoCenterComponent,
    OverlayModelComponent,
    TimeAgoPipe,
    InfoNotificationPageComponent,
    AddiFeaturePageComponent,
    TempIngredientsListComponent,
    TaskLoadingNotificationComponent,
    ToggleContainerComponent,
    CreditPageComponent,
  ],
  
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,
    InfiniteScrollDirective,
    MaterialModule,
    BrowserAnimationsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
