import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}
// tslint:disable-next-line:max-line-length
//  La sérialisation d'une date en JSON prend en compte la date locale mais sans préciser le fuseau horaire, du coup côté serveur quand on dé-sérialize on a un décalage
//  petite fonction récupérée sur StackOverflow pour corriger ça (en indiquant le bon fuseau horaire dans la sérialisation json)
//  http://stackoverflow.com/questions/31096130/how-to-json-stringify-a-javascript-date-and-preserve-timezone
Date.prototype.toJSON = function () {
  const timezoneOffsetInHours = -(this.getTimezoneOffset() / 60); // UTC minus local time
  const sign = timezoneOffsetInHours >= 0 ? '+' : '-';
  const leadingZero = (timezoneOffsetInHours < 10) ? '0' : '';

  // It's a bit unfortunate that we need to construct a new Date instance
  // (we don't want _this_ Date instance to be modified)
  const correctedDate = new Date(this.getFullYear(), this.getMonth(),
    this.getDate(), this.getHours(), this.getMinutes(), this.getSeconds(),
    this.getMilliseconds());
  correctedDate.setHours(this.getHours() + timezoneOffsetInHours);
  const iso = correctedDate.toISOString().replace('Z', '');

  return iso + sign + leadingZero + Math.abs(timezoneOffsetInHours).toString() + ':00';
};
// TODO dans un autre fichier gros cochon que tu es ...!

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
