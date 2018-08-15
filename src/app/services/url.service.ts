import { Injectable } from '@angular/core';

const BASE_DATA_URI = 'http://localhost:55447/'; // paske sinon c'est la misère à trouver hein !

// tslint:disable-next-line:max-line-length
// bon , on pourrait dire que c'est un peu too much un service pour 3 urls , mais après , une fois qu'on l'aurait dit , ben ...on l'aurait dit


@Injectable(
)
export class UrlService {

  constructor() { }

  private readonly _templates = 'assets/templates.html';

  private readonly _calendar = BASE_DATA_URI + 'Data/LoadCalendars';

  private readonly _appointments = BASE_DATA_URI + '/Data/LoadAppointments?json=';


/// Url des templates pour la construction du calendrier
  get TemplatesUrl() {
    return this._templates;
  }

  /// Url des données pour la construction du calendrier
  get CalendarUrl() {
    return this._calendar;
  }
  /// Url des rendez-vous
  get AppointmentsUrl() {
    return this._appointments;
  }


}
