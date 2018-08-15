import { Component, AfterViewInit, OnInit, Output, EventEmitter, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as $ from 'jquery'; // on peut tout faire sans jquery ici ,mais c'est plus facile pour tricher :)
import * as GridControls from 'gridControls';
import * as Bridge from 'bridge';
import PerfectScrollbar from 'perfect-scrollbar';

import { UrlService } from '../services';




// tslint:disable:max-line-length
// tslint:disable:comment-format
//petite note : pour aller vite , les manips de DOM sont faites avec JQuery et la déclaration des events aussi (parce qu'en fait j'ai triché et que j'ai piqué plein de
// code au js de Patrick , après avoir , évidemment corrigé les milliers d'erreurs xD ...).Mais tout peut se faire aussi bien et vite à la manière Angular...
//Pareil , j'ai pas encadré certaines manips de DOM avec zone.RunOutsideAngular , mais ça faut faire au cas par cas et pas n'importe quoi

//pour bien faire aussi , j'aurais dû renvoyer les events et callbacks avec des EventEmitter et des Observables , mais bon , j'ai vraiment fait ça
// à la va-vite (mais j'ai quand même mis un exemple , nanère..) , c'est qu'un tout ptit début de rien du tout.....donc, soyez indulgents vu que c'est un peu tout pourri :)
//Tout doux : d'ailleurs , la prochaine et première étape logique serait de faire une directive pour remplacer l'id mScheduler dans le Html , et pourquoi pas lui passer des options comme le nb de jours affichés tout ça tout ça
@Component({
    // tslint:disable-next-line:component-selector
    selector: 'iko-schedule',
    templateUrl: './schedule.component.html',
    providers: [UrlService],
    styleUrls: ['./schedule.component.css']
})

export class ScheduleComponent implements AfterViewInit, OnInit {

    templatesContent: string;
    //juste pour l'exemple, ce qu'il faut faire sur les callbacks du contrôle :
    @Output() schedulerItemClick = new EventEmitter<GridControls.SchedulerMouseEventArgs>(true); // async , pour sortir de la boucle de l'event originel

    ngOnInit(): void {

        $(window).on('load resize', function () {
            let height = $(window).innerHeight();
            height -= $('#menu-bar').outerHeight();
            height -= $('footer').outerHeight();
            height -= $('#schedulerToolBar').outerHeight();
            height -= 70;

            const $sc = $('#mScheduler');
            $sc.height(height);

            if ($sc.css('display') === 'none') {
                $sc.fadeIn();
            }
            const lay = GridControls.Grid.query($('#mScheduler .scheduler-composite-layout').get(0));
            if (lay) {
                lay.layout();
            }
        });


    }

    constructor(private _http: HttpClient, private _urls: UrlService, private _zone: NgZone) { }

    ngAfterViewInit(): void {
        if ($('#mScheduler').length > 0) {

            this.setCustomScollQuickAndDirty();
            //comme ça si on veut on met les templates sur un serveur externe ou autre (si on voulait vraiment être Angularesques cet appel viendrait d'un service , mais bon...)
            this._http.get(this._urls.TemplatesUrl, { responseType: 'text' }).subscribe(data => {
                this.templatesContent = data;
                this.prepareSchedulerForDisplay();
            });

        }
    }



    //******************************************************************************Méthodes .... à la rubia :) **********************************************************/

    private setCustomScollQuickAndDirty() {

        //TOut DOux :   l' a fallu refaire ces méthodes avec le package perfect-scrollbar , la version jquery est chelou avec Angular (pas le temps de mieux, j'ai que quelques heures :)  )
        //faut revoir ça bien , des fois c'est bizaouarifique ....
        //-------------------------
        //  Scroll personnalisé, sauf pour les téléphones/tablettes (tests faits par Bridge.net, basés sur l'useragent du navigateur)
        //-------------------------
        //  lier le scroll personnalisé à un élément
        //Fab : Quick&Dirty Fix :)

        //bon , là faut le mettre sinon , vla les perfs !!
        this._zone.runOutsideAngular(() => {
            const myMap = new Map<HTMLElement, PerfectScrollbar>();
            GridControls.GridOptions.bindCustomScrollbars = e => {
                if (Bridge.Browser.isTablet === false && Bridge.Browser.isPhone === false) {
                    const pf = new PerfectScrollbar(e);
                    myMap.set(e, pf);
                }
            };
            //  supprimer le scroll personnalisé à un élément
            GridControls.GridOptions.unbindCustomScrollbars = e => {
                if (Bridge.Browser.isTablet === false && Bridge.Browser.isPhone === false) {
                    const pf = myMap.get(e);
                    if (pf) {
                        pf.destroy();
                        myMap.delete(e);
                    }
                }
            };
            //  informer le scroll personnalisé d'un changement par code
            GridControls.GridOptions.updateCustomScrollbars = e => {
                if (Bridge.Browser.isTablet === false && Bridge.Browser.isPhone === false) {
                    const pf = myMap.get(e);
                    if (pf) {
                        pf.update();
                    }
                }
            };
        });
    }

    private prepareSchedulerForDisplay() {


        //------------------------
        //  Source de données pour le ou les calendriers
        //------------------------
        const dataSourceOptions = this.createDataSourceOptions(this._urls.CalendarUrl, e => {
            //  on fait simple : on passe l'objet en argument et on récupérera la même classe côté serveur
            return this._urls.AppointmentsUrl + encodeURIComponent(JSON.stringify(e));
        }, objectsArray => {
            for (let i = 0; i < objectsArray.length; i++) {
                const tmpFacile = (<any>objectsArray[i]);
                tmpFacile.LayerID = tmpFacile.Type === 'AppointmentItem' ? 'appointments' : 'workhours';
                // tslint:disable-next-line:radix
                tmpFacile.DateTime = new Date(parseInt(tmpFacile.DateTime.substr(6)));
            }
            return objectsArray;
        });
        const dataSource = GridControls.SchedulerDataSource.create(dataSourceOptions);
        //--------------------------
        //  options pour la création du contrôle
        //--------------------------
        const options = this.createSchedulerOptions('ps-scrollbar-x-rail ps-scrollbar-y-rail', 8, 19, 3, 5);
        //--------------------------
        //  templating
        this.fillTemplates(options);
        //------------------------------------
        //callbacks
        this.setOptionsCallbacks(
            options,
            mouseEventArgs => this._zone.runOutsideAngular(() => {  // voilou , pour bien faire , comment déclarer les events jquqery ou DOM hors Angular , mais j'y ai pas fait partout paske bon
                //  Dé-sélection
                $('#mScheduler .active').removeClass('active');
                $('#mScheduler .selected').removeClass('selected');
                //  Et sélection du groupe + bouton de positionnement sur l'élément sélectionné
                for (let i = 0; i < mouseEventArgs.items.length; i++) {
                    const item = <any>mouseEventArgs.items[i];
                    if (item.LayerID === 'appointments') {
                        //  Sélection d'un service
                        let container = mouseEventArgs.scheduler.getItemContainer(item);
                        $(container).addClass('active');
                        //  on marque le groupe d'élément comme sélectionné
                        const group = dataSource.getGroupItems(item);
                        for (let j = 0; j < group.length; j++) {
                            container = mouseEventArgs.scheduler.getItemContainer(group[j]);
                            $(container).addClass('selected');
                        }
                        return;
                    }
                }
                this._zone.run(() =>
                    //on émet l'event Angular , qui devient écoutable depuis le composant parent
                    this.schedulerItemClick.next(mouseEventArgs)); //...et voilou

            }),
            mouseEventArgs => {
                //  est-ce qu'on a double-cliqué sur un RDV ?
                let appointmentObject = null;
                for (let i = 0; i < mouseEventArgs.items.length; i++) {
                    const item = <any>mouseEventArgs.items[i];
                    if (item.LayerID === 'appointments') {
                        appointmentObject = item;
                        break;
                    }
                }
                //  Oui, mais on doit avoir cliqué sur le service, pas sur le temps de pause
                if (appointmentObject != null) {
                    for (let i = 0; i < mouseEventArgs.elements.length; i++) {
                        if ($(mouseEventArgs.elements[i]).hasClass('appointment-item-service')) {
                            //  ok
                            alert('edit appointment ID=' + appointmentObject.ID);
                            return;
                        }
                    }
                }
                // tslint:disable-next-line:max-line-length
                alert('create appointment : ' + mouseEventArgs.calendarID + ' ' + mouseEventArgs.hour.toString() + ':' + mouseEventArgs.minute.toString());
            });

        //--------------------------
        //   création du contrôle
        //--------------------------
        const scheduler = this.createSchedulerControl(options, dataSource);

        // ----------------------
        //   Interactions avec l'UI
        this.setSchedulerUIInteractions(scheduler, options, dataSource);

        // si on chargeait le truc avec la page , faudrait mettre ça , mais là , on "LazyLoad" à l'appui sur le lien..
        /*  $(document).ready(() => {
              //  On ne place le contrôle dans le DOM que quand la page est prête
              scheduler.attach($('#mScheduler').get(0));
          });*/
        // du coup ,on l'attache ici en "direct"
        scheduler.attach($('#mScheduler').get(0));

        return scheduler;  //pour faire genre Fluent ouanagaine
    }

    // tslint:disable-next-line:max-line-length
    private setSchedulerUIInteractions(scheduler: GridControls.Scheduler, options: GridControls.SchedulerOptions, dataSource: GridControls.SchedulerDataSource) {
        $('#schedulerPrevDate').click(() => {
            //  jour d'avant
            scheduler.setViewDate(new Date(options.viewDate.valueOf() + Math.round((-1) * 864e5)));
        });
        $('#schedulerNextDate').click(() => {
            //  jour d'après
            scheduler.setViewDate(new Date(options.viewDate.valueOf() + Math.round((1) * 864e5)));
        });
        $('#schedulerRotate').click(() => {
            options.layout.inverseDirection = !options.layout.inverseDirection;
            scheduler.destroy();
            scheduler = this.createSchedulerControl(options, dataSource);
            scheduler.attach($('#mScheduler').get(0));
        });
        return scheduler;
    }

    // tslint:disable-next-line:max-line-length
    private createSchedulerControl(options: GridControls.SchedulerOptions, dataSource: GridControls.SchedulerDataSource) {

        //  On change les tailles selon l'orientation
        if (options.layout.inverseDirection) {
            options.layout.cellWidth = 18;
            options.layout.cellWidthUnit = '%';
            options.layout.cellHeight = 18;
            options.layout.cellHeightUnit = '%';
            options.layout.rowsHeaderWidth = 90;
            options.layout.columnsHeaderHeight = 80;
            options.layout.minCellsWidth = 120;
            options.layout.minRowsHeight = 120;
        } else {
            options.layout.cellWidth = 18;
            options.layout.cellWidthUnit = '%';
            options.layout.cellHeight = 120;
            options.layout.cellHeightUnit = 'px';
            options.layout.rowsHeaderWidth = 80;
            options.layout.columnsHeaderHeight = 90;
            options.layout.minCellsWidth = 120;
            options.layout.minRowsHeight = 80;
        }

        const scheduler = GridControls.Scheduler.create(options);
        scheduler.suspendLayout();
        // --------------------------
        //  positionnement des différents calques

        //  d'abord les horaires, avec la classe css workhours-layer
        scheduler.addItemsLayer('workhours', ['workhours-layer']);

        //  ensuite la grille : on met une classe css pour l'orientation des divisions horaires
        scheduler.addGridLinesLayer(options.layout.inverseDirection ? 'vertical-hours' : 'horizontal-hours');

        //  et enfin les éléments de RDV, avec la classe css appointments-layer
        scheduler.addItemsLayer('appointments', ['appointments-layer'], false, 0, 40);

        scheduler.resumeLayout();

        //  liaison avec le gestionnaire de données
        scheduler.setDataSource(dataSource);
        return scheduler;
    }



    private setOptionsCallbacks(options: GridControls.SchedulerOptions,
        onItemClick: (arg: GridControls.SchedulerMouseEventArgs) => void,
        onItemDblClick: (arg: GridControls.SchedulerMouseEventArgs) => void) {

        // zinzin qui tourne
        options.callbacks.onAjaxRequest = function (scheduler, bRunningRequests) {

            const $w = $(scheduler.getEmptySpaceElement());
            if (bRunningRequests) {
                $w.addClass('loading');
            } else {
                $w.removeClass('loading');
            }
        };

        // -----
        //  affichage de l'heure dans le coin haut gauche
        options.callbacks.onTimeChanged = function (scheduler, time) {
            const $w = $(scheduler.getEmptySpaceElement());
            let $s;
            if ($w.children().length === 0) {
                $s = jQuery('<div style=\'position: relative; width: 100%; height: 100%;\'><span></span></div>');
                $s.appendTo($w);
            }
            $s = $w.find('span');
            $s.text(time);
        };


        //  affichage de la date dans le label fait pour (propre à la page)
        options.callbacks.onDateChanged = function (s, date) {
            const dateformat = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            $('#schedulerDate').text(date.toLocaleDateString('fr-FR', dateformat));
        };
        // -----------------
        //  Click / double-click (pasés en paramètre , c'est plus zboubi ...)
        options.callbacks.onDoubleClick = onItemDblClick;

        options.callbacks.onClick = onItemClick;
    }

    private fillTemplates(options: GridControls.SchedulerOptions, templateHtml?: JQuery<HTMLElement>) {

        const template = templateHtml || $(this.templatesContent); // si on l'a pas en param , on récupère ce qu'on a lu au début (qui peut provenir d'où on veut hein , c'est un http get)
        //  header des heures
        const template_hours = template.filter('#hours-header').html().trim();
        options.template.hoursTemplate = (h) => {
            return template_hours.replace('$hour$', h.toString() + ':00');
        };
        //  en-tête des calendriers
        const template_employee = template.filter('#employee-header').html().trim();
        const template_resource = template.filter('#resource-header').html().trim();

        options.template.calendarsTemplate = (calendarObject) => {
            //  nos objets "calendrier" contiennent une propriété qui commence soit par E (employé) soit par R (ressource)
            //  on met un template d'en-tête différent selon le type
            if (calendarObject.CalendarID.substr(0, 1) === 'E') {
                return template_employee.replace('$name$', calendarObject.Name);
            } else {
                return template_resource.replace('$name$', calendarObject.Name);
            }
        };

        //  dessin des lignes
        options.template.rowsHtmlContent = template.filter('#horizontal-grid-lines').html().trim();
        options.template.columnsHtmlContent = template.filter('#vertical-grid-lines').html().trim();

        //  Eléments de rendez-vous
        const templateItems = template.filter('#appointment-template').html().trim();

        options.callbacks.getItemHtmlTemplate = (scheduler, layerName, appointmentObject) => {
            //  les données contiennent les heures de travail et les rendez-vous, ne veut garder que les RDV
            if (layerName !== 'appointments') {
                return null;
            }
            const pauseDurationPct = appointmentObject.PauseDuration * 100 / appointmentObject.Duration;
            let styles = appointmentObject.ServiceColor + '; ';
            if (options.layout.inverseDirection) {
                styles += 'right: ' + pauseDurationPct.toString() + '%; ';
                styles += 'bottom: 0';
            } else {
                styles += 'bottom: ' + pauseDurationPct.toString() + '%; ';
                styles += 'right: 0';
            }
            let content = templateItems.replace('rgb(0, 0, 0)', styles);

            content = content.replace('$client$', appointmentObject.ClientName);
            content = content.replace('$service$', appointmentObject.ServiceName);
            if (appointmentObject.IsConfirmed) {
                content = content.replace('hide-picto-1', '');
            }
            if (appointmentObject.IsOnlineAppointment) {
                content = content.replace('hide-picto-2', '');
            }
            //  couleur de fond générale : couleur de la pause
            content = content.replace('rgb(1, 1, 1)', appointmentObject.PauseColor);

            return content;
        };
    }

    private createSchedulerOptions(nonClickableClasses: string, from: number, to: number, days: number, dysSep: number) {
        const options = new GridControls.SchedulerOptions();
        //  Pour empêcher qu'un clic sur les barres de scrolling génère un clic sur un rdv
        options.mouseEvents.nonClickableCssClasses = nonClickableClasses;

        //  Horaires
        options.firstHour = from;
        options.lastHour = to;
        options.numberOfVisibleDays = days;
        options.layout.daysSeparationSize = dysSep;

        //  déplacement
        options.callbacks.prepareMoveItems = (moveArgs) => {

            const item = moveArgs.item;
            if (item.LayerID === 'appointments') {
                //  test déplacement multiple
                // moveArgs.itemsToMove = dataSource.getGroupItems(item);
                moveArgs.itemsToMove = [];
                moveArgs.itemsToMove.push(item);
            }
        };
        //  resize TODO ??
        options.callbacks.prepareResizeItem = (resizeArgs) => {
        };
        return options;
    }

    private createDataSourceOptions(calendarUrl: string,
        buildItemsUrlFunc: (e: GridControls.LoadItemsUrlBuilderEventArgs) => string,
        onItemsDownloadedFunc?: (objArray: object[]) => object[]
    ) {
        const dataSourceOptions = new GridControls.SchedulerDataSourceOptions();
        //  URL où télécharger les calendriers (employés, ressources, ...)
        dataSourceOptions.calendarsUrl = calendarUrl;

        // TODO pour la factorisation , passer un objet options en param


        //  Le contrôle a besoin de connaitre le nom de certains champs des objets "rendez-vous" ou "calendrier"
        dataSourceOptions.itemDateField = 'DateTime'; //  date des RDV
        dataSourceOptions.itemDurationField = 'Duration'; //    et leur durée
        dataSourceOptions.itemIDField = 'ID'; //  Identifiant du RDV
        dataSourceOptions.itemCalendarField = 'CalendarID'; //  Calendrier associé à ce RDV
        dataSourceOptions.itemCssClassField = 'CssClass';
        dataSourceOptions.itemGroupField = 'ClientName';
        // tslint:disable-next-line:max-line-length
        dataSourceOptions.itemLayerField = 'LayerID'; //  calque sur lequel sera posé cet élément :  ATTENTION : ne provient pas du modèle renvoyé par le serveur, c'est défini dans onItemsDownloaded
        dataSourceOptions.calendarIDField = 'CalendarID'; //  Identifiant du calendrier
        // tslint:disable:max-line-length
        dataSourceOptions.calendarPinnedField = 'PinDirection'; //  Colonnes épinglées, la propriété doit contenir left ou right, sinon elle ne sera pas épinglée

        //  fonction qui construit l'URL à appeler pour télécharger les rdv
        dataSourceOptions.loadItemsUrlBuilder = buildItemsUrlFunc;

        //  définition du calque de destination pour les éléments en fonction de leur type (ça aurait très bien pu être fait côté serveur, mais c'est pour l'exemple)
        //  on en profite aussi pour corriger les dates sérialisées par MVC qui sont dans un format chelou : \/Date(xxxxxx)

        if (onItemsDownloadedFunc) {
            dataSourceOptions.onItemsDownloaded = onItemsDownloadedFunc;
        }

        return dataSourceOptions;
    }
}










