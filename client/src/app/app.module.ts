import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { EmailVerificationComponent } from './email-verification/email-verification.component';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { FooterComponent } from './footer/footer.component';
import { ClarityModule } from 'clarity-angular';
import { HomeComponent } from './home/home.component';
import { ApplicationRouting } from "./app.routing";

@NgModule({
  imports: [
    ClarityModule.forRoot(),
    ApplicationRouting,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpModule,
  ],
  declarations: [
    AppComponent,
    EmailVerificationComponent,
    MainMenuComponent,
    FooterComponent,
    HomeComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
