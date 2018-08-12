import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { Router } from '@angular/router';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { PageNotFoundComponent } from './not-found.component';
import { IkoMessageComponent } from './iko-message.component';
import { FormsModule } from '@angular/forms';
import { PagePluBelleComponent } from './pageplubelle';
import { ZoulikPageComponent } from './zoulipage';
import { AlorAlorComponent } from './aloralor';

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    IkoMessageComponent,
    PagePluBelleComponent,
    ZoulikPageComponent,
    AlorAlorComponent

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule {
  // sympa pour debug , la config du router (j'ai piqué ça à l'exmple "router" de la doc)
  constructor(router: Router) {
    console.log('Routes: ', JSON.stringify(router.config, undefined, 2));
  }
}

