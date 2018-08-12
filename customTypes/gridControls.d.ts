


/**
 * @memberof GridControls
 * @callback GridControls.SchedulerOnClickDelegate
 * @param   {GridControls.SchedulerMouseEventArgs}    arg
 * @return  {void}
 */

/**
 * @memberof GridControls
 * @callback GridControls.SchedulerOnTimeChangedDelegate
 * @param   {GridControls.Scheduler}    scheduler       
 * @param   {string}                    formatedTime
 * @return  {void}
 */

/**
 * @memberof GridControls
 * @callback GridControls.SchedulerOnDateChangedDelegate
 * @param   {GridControls.Scheduler}    scheduler    
 * @param   {Date}                      date
 * @return  {void}
 */

/**
 * @memberof GridControls
 * @callback GridControls.SchedulerOnAjaxRequestDelegate
 * @param   {GridControls.Scheduler}    scheduler         
 * @param   {boolean}                   runningRequest
 * @return  {void}
 */

/**
 * @memberof GridControls
 * @callback GridControls.SchedulerGetItemTemplateDelegate
 * @param   {GridControls.Scheduler}    scheduler     
 * @param   {string}                    layerName     
 * @param   {Object}                    itemObject
 * @return  {string}
 */

/**
 * @memberof System
 * @callback System.Action
 * @param   {GridControls.SchedulerDataSource}    arg
 * @return  {void}
 */

/** @namespace System */

/**
 * @memberof System
 * @callback System.Func
 * @param   {GridControls.LoadItemsUrlBuilderEventArgs}    arg
 * @return  {string}
 */

/// <reference path="bridge.d.ts" />

declare module 'gridControls' {
    export = GridControls;
}


declare module GridControls {

        export interface _ActionReconizer {
        bind: {(arg: UIEvent): HTMLElement};
        onDetected: {(arg: HTMLElement): void};
        cancel(): void;
        restart(): void;
        _OnTimer(): void;
        destroy(): void;
        /**
         * Indique si l'événement doit être traité (retour à vrai) par le système de reconnaissance ou pas (retour à faux)
         *
         * @instance
         * @protected
         * @this GridControls._ActionReconizer
         * @memberof GridControls._ActionReconizer
         * @param   {UIEvent}                               evt      
         * @param   {GridControls._ActionReconizerState}    state
         * @return  {boolean}
         */
        _ShouldProcessEvent(evt: UIEvent, state: GridControls._ActionReconizerState): boolean;
        _OnEvent(evt: UIEvent): void;
    }
    export interface _ActionReconizerFunc extends Function {
        prototype: _ActionReconizer;
        new (surface: HTMLElement): _ActionReconizer;
    }
    var _ActionReconizer: _ActionReconizerFunc;

    export enum SchedulerErrors {
        loadCalendars = 0,
        loadItems = 1
    }

    export interface SchedulerMouseEventArgs {
        /**
         * Contrôle Scheduler qui a émis l'événement
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerMouseEventArgs
         * @type GridControls.Scheduler
         */
        scheduler: GridControls.Scheduler;
        /**
         * Liste des items de RDV présents sous le curseur au moment de l'événement
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerMouseEventArgs
         * @type Array.<Object>
         */
        items: Object[];
        /**
         * Identifiant du calendrier
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerMouseEventArgs
         * @type string
         */
        calendarID: string;
        /**
         * Heure entière (sans les minutes)
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerMouseEventArgs
         * @type number
         */
        hour: number;
        /**
         * Minute
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerMouseEventArgs
         * @type number
         */
        minute: number;
        /**
         * Event original fourni par jQuery
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerMouseEventArgs
         * @type any
         */
        originalEvent: any;
        /**
         * Liste de tous les éléments HTML placés sous le curseur au moment du clic
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerMouseEventArgs
         * @type Array.<HTMLElement>
         */
        elements: HTMLElement[];
    }
    export interface SchedulerMouseEventArgsFunc extends Function {
        prototype: SchedulerMouseEventArgs;
        new (): SchedulerMouseEventArgs;
    }
    var SchedulerMouseEventArgs: SchedulerMouseEventArgsFunc;

    export interface SchedulerMoveItemsEventArgs {
        /**
         * Contrôle Scheduler qui a émis l'événement
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerMoveItemsEventArgs
         * @type GridControls.Scheduler
         */
        scheduler: GridControls.Scheduler;
        /**
         * Element HTML qui a déclenché le déplacement
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerMoveItemsEventArgs
         * @type HTMLElement
         */
        moveElement: HTMLElement;
        /**
         * Objet de rendez-vous pour lequel l'événement a été déclenché
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerMoveItemsEventArgs
         * @type any
         */
        item: any;
        /**
         * Tableau retourné par l'utilisateur fournissant la liste du ou des éléments à déplacer
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerMoveItemsEventArgs
         * @type Array.<Object>
         */
        itemsToMove: Object[];
        /**
         * Liste des emplacement autorisés pour le déplacement. Tous les items de RDV doivent pouvoir être inscrits
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerMoveItemsEventArgs
         * @type Array.<GridControls.CalendarTimeRange>
         */
        allowedTimeRanges: GridControls.CalendarTimeRange[];
        /**
         * Permet le déplacement d'un calendrier à un autre
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerMoveItemsEventArgs
         * @default true
         * @type boolean
         */
        allowCalendarChange: boolean;
        /**
         * Permet le déplacement sur l'axe horaire
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerMoveItemsEventArgs
         * @default true
         * @type boolean
         */
        allowTimeChange: boolean;
        /**
         * Permet le déplacement d'un scheduler à un autre
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerMoveItemsEventArgs
         * @default true
         * @type boolean
         */
        allowDateChange: boolean;
        /**
         * Annule l'action
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerMoveItemsEventArgs
         * @default false
         * @type boolean
         */
        cancel: boolean;
        /**
         * Internvalle, en minutes
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerMoveItemsEventArgs
         * @default 5
         * @type number
         */
        step: number;
    }
    export interface SchedulerMoveItemsEventArgsFunc extends Function {
        prototype: SchedulerMoveItemsEventArgs;
        new (): SchedulerMoveItemsEventArgs;
    }
    var SchedulerMoveItemsEventArgs: SchedulerMoveItemsEventArgsFunc;

    export interface SchedulerOptions {
        /**
         * 
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerOptions
         * @type GridControls._SchedulerMouseOptions
         */
        mouseEvents: GridControls._SchedulerMouseOptions;
        /**
         * Callbacks disponibles pour l'implémentation du contrôle
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerOptions
         * @type GridControls._SchedulerOptionsCallbacks
         */
        callbacks: GridControls._SchedulerOptionsCallbacks;
        /**
         * Options de disposition
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerOptions
         * @type GridControls._SchedulerOptionsLayout
         */
        layout: GridControls._SchedulerOptionsLayout;
        /**
         * Définition des templates à utiliser
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerOptions
         * @type GridControls._SchedulerOptionsTemplates
         */
        template: GridControls._SchedulerOptionsTemplates;
        /**
         * Date consultée
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerOptions
         * @type Date
         */
        viewDate: Date;
        /**
         * Première heure visible
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerOptions
         * @default 8
         * @type number
         */
        firstHour: number;
        /**
         * Dernière heure visible
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerOptions
         * @default 19
         * @type number
         */
        lastHour: number;
        numberOfVisibleDays: number;
    }
    export interface SchedulerOptionsFunc extends Function {
        prototype: SchedulerOptions;
        new (): SchedulerOptions;
    }
    var SchedulerOptions: SchedulerOptionsFunc;

    export interface SchedulerResizeItemEventArgs {
        /**
         * Contrôle Scheduler qui a émis l'événement
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerResizeItemEventArgs
         * @type GridControls.Scheduler
         */
        scheduler: GridControls.Scheduler;
        /**
         * Element HTML qui a déclenché le déplacement
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerResizeItemEventArgs
         * @type HTMLElement
         */
        resizeElement: HTMLElement;
        /**
         * Item de RDV dont la durée va être modifiée
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerResizeItemEventArgs
         * @type Object
         */
        item: Object;
        /**
         * Liste des emplacement autorisés pour le déplacement. Tous les items de RDV doivent pouvoir être inscrits
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerResizeItemEventArgs
         * @type Array.<GridControls.CalendarTimeRange>
         */
        allowedTimeRanges: GridControls.CalendarTimeRange[];
        /**
         * Annule l'action
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerResizeItemEventArgs
         * @default false
         * @type boolean
         */
        cancel: boolean;
        /**
         * Durée mini d'un rdv, en mintutes
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerResizeItemEventArgs
         * @default 15
         * @type number
         */
        minDuration: number;
        /**
         * Intervalle, en minutes
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerResizeItemEventArgs
         * @default 5
         * @type number
         */
        step: number;
    }
    export interface SchedulerResizeItemEventArgsFunc extends Function {
        prototype: SchedulerResizeItemEventArgs;
        new (): SchedulerResizeItemEventArgs;
    }
    var SchedulerResizeItemEventArgs: SchedulerResizeItemEventArgsFunc;

    export interface _BaseControl extends GridControls._GridElement {
        getIsAttached(): boolean;
        attach(host: HTMLElement): void;
        detach(): void;
        destroy(): void;
    }
    export interface _BaseControlFunc extends Function {
        prototype: _BaseControl;
        new (): _BaseControl;
    }
    var _BaseControl: _BaseControlFunc;

    /** @namespace GridControls */
    
    /**
     * classe utilisée pour les calculs du layout
     *
     * @public
     * @class GridControls._GridItemCell
     * @augments GridControls._GridElement
     */
    export interface _GridItemCell extends GridControls._GridElement {
        x: number;
        y: number;
        getItems(): Bridge.List$1<GridControls._LayerItem>;
        setItems(value: Bridge.List$1<GridControls._LayerItem>): void;
        getKey(): string;
    }
    export interface _GridItemCellFunc extends Function {
        prototype: _GridItemCell;
        new (): _GridItemCell;
        makeKey(x: number, y: number): string;
    }
    var _GridItemCell: _GridItemCellFunc;

    export interface _GridLayer extends GridControls._GridElement {
        grid: GridControls._BaseGrid;
        layerElement: HTMLElement;
        overlapingEnabled: boolean;
        itemsPaddingStart: number;
        itemsPaddingEnd: number;
        /**
         * Le chevauchement n'est permis que dans un sens au seins d'un même calque
         Les éléments placés pourront faire partie de plusieurs cellules uniquement dans cette direction
         *
         * @instance
         * @public
         * @memberof GridControls._GridLayer
         * @type GridControls.Axis
         */
        flowDirection: GridControls.Axis;
        invalidateCells(): void;
        removeAllItems(): void;
        /**
         * MÉTHODE À USAGE INTERNE UNIQUEMENT
         *
         * @instance
         * @public
         * @this GridControls._GridLayer
         * @memberof GridControls._GridLayer
         * @return  {void}
         */
        _InternalLayout(): void;
        /**
         * Détermine toutes les "cellules" occupées par un élément
         *
         * @instance
         * @private
         * @this GridControls._GridLayer
         * @memberof GridControls._GridLayer
         * @param   {Bridge.Dictionary$2}        cells    
         * @param   {GridControls._LayerItem}    item
         * @return  {void}
         */
        calcItemCells(cells: Bridge.Dictionary$2<string,GridControls._GridItemCell>, item: GridControls._LayerItem): void;
        addItem(item: GridControls._LayerItem): void;
        removeItem(id: number): HTMLElement;
        _GetItemElement(id: number): HTMLElement;
        /**
         * MÉTHODE À USAGE INTERNE UNIQUEMENT
         *
         * @instance
         * @public
         * @this GridControls._GridLayer
         * @memberof GridControls._GridLayer
         * @return  {void}
         */
        _Dispose(): void;
        toString(): string;
    }
    export interface _GridLayerFunc extends Function {
        prototype: _GridLayer;
        new (grid: GridControls._BaseGrid): _GridLayer;
    }
    var _GridLayer: _GridLayerFunc;

    export interface _GridRange extends GridControls._GridElement {
        /**
         * taille exprimée selon l'unité choisie
         *
         * @instance
         * @public
         * @memberof GridControls._GridRange
         * @type number
         */
        size: number;
        /**
         * Unité : px ou %
         *
         * @instance
         * @public
         * @memberof GridControls._GridRange
         * @type string
         */
        sizeUnit: string;
        /**
         * Taille mini de la rangée, en pixels
         *
         * @instance
         * @public
         * @memberof GridControls._GridRange
         * @type number
         */
        minSize: number;
        maxPctSize: number;
        data: Object;
        hidden: boolean;
        marginStart: number;
        marginEnd: number;
    }
    export interface _GridRangeFunc extends Function {
        prototype: _GridRange;
        new (): _GridRange;
    }
    var _GridRange: _GridRangeFunc;

    export interface SchedulerErrorEventArgs {
        errorType: GridControls.SchedulerErrors;
        errorData: string;
        errorDescription: string;
    }
    export interface SchedulerErrorEventArgsFunc extends Function {
        prototype: SchedulerErrorEventArgs;
        new (): SchedulerErrorEventArgs;
    }
    var SchedulerErrorEventArgs: SchedulerErrorEventArgsFunc;

    /**
     * Classe exposée permettant de définir les coordonnées d'un élément dans le système de grille
     *
     * @public
     * @class GridControls.ItemPosition
     * @augments GridControls._GridElement
     */
    export interface ItemPosition extends GridControls._GridElement {
        /**
         * Index de la rangée indiquée par la direction de la grille
         *
         * @instance
         * @public
         * @memberof GridControls.ItemPosition
         * @default 0
         * @type number
         */
        axisIndex: number;
        start: number;
        end: number;
        paddingStart: number;
        paddingEnd: number;
        itemStartOffset: number;
        itemEndOffset: number;
    }
    export interface ItemPositionFunc extends Function {
        prototype: ItemPosition;
        new (): ItemPosition;
    }
    var ItemPosition: ItemPositionFunc;

    export interface _SchedulerResizeItem extends GridControls._SchedulerMouseAction {
        _actionData: GridControls.SchedulerResizeItemEventArgs;
        _ProcessMouseMoveEvent(evt: any): boolean;
        getComparisonString(): string;
        _Initialize(evt: any): void;
        _OnStop(): void;
        _SetActionData(data: Object): void;
    }
    export interface _SchedulerResizeItemFunc extends Function {
        prototype: _SchedulerResizeItem;
        new (): _SchedulerResizeItem;
    }
    var _SchedulerResizeItem: _SchedulerResizeItemFunc;

    export interface Action_ClickBase extends GridControls._ActionReconizer {
        cancel(): void;
        _DetectGesture(newEvent: boolean): void;
    }
    export interface Action_ClickBaseFunc extends Function {
        prototype: Action_ClickBase;
        new (surface: HTMLElement): Action_ClickBase;
    }
    var Action_ClickBase: Action_ClickBaseFunc;

    export interface Action_DragAndDrop extends GridControls._ActionReconizer {
        _ShouldProcessEvent(evt: UIEvent, state: GridControls._ActionReconizerState): boolean;
        _DetectGesture(newEvent: boolean): void;
    }
    export interface Action_DragAndDropFunc extends Function {
        prototype: Action_DragAndDrop;
        new (surface: HTMLElement): Action_DragAndDrop;
    }
    var Action_DragAndDrop: Action_DragAndDropFunc;

    export interface Table extends GridControls.CompositeGrid {
        populate(): void;
    }
    export interface TableFunc extends Function {
        prototype: Table;
        new (host: HTMLElement): Table;
    }
    var Table: TableFunc;

    export interface _BaseGrid extends GridControls._BaseControl {
        identifier: string;
        _Options: GridControls.GridOptions;
        _ViewPortElement: HTMLElement;
        _LayersContainerElement: HTMLElement;
        _Layers: Bridge.Dictionary$2<number,GridControls._GridLayer>;
        _ViewPortRef: HTMLElement;
        _Rows: Bridge.List$1<GridControls._GridRange>;
        _Columns: Bridge.List$1<GridControls._GridRange>;
        scrollChangedCallback: {(arg1: GridControls._BaseGrid, arg2: number, arg3: number): void};
        _LayoutRequested: boolean;
        getNumRows(): number;
        getNumColumns(): number;
        get_ControlElement(): HTMLElement;
        getIsLayoutSuspended(): boolean;
        /**
         * Désactive le layouting automatique
         *
         * @instance
         * @public
         * @this GridControls._BaseGrid
         * @memberof GridControls._BaseGrid
         * @return  {void}
         */
        suspendLayout(): void;
        /**
         * Réactive le layouting automatique
         Si c'est le dernier verrou alors un recalcul du layout est automatiquent effectué
         *
         * @instance
         * @public
         * @this GridControls._BaseGrid
         * @memberof GridControls._BaseGrid
         * @return  {void}
         */
        resumeLayout(): void;
        /**
         * Changement de la largeur d'une colonne de la grille
         *
         * @instance
         * @public
         * @this GridControls._BaseGrid
         * @memberof GridControls._BaseGrid
         * @param   {number}    columnIndex    
         * @param   {number}    width          
         * @param   {string}    unit           
         * @param   {number}    minWidth
         * @return  {void}
         */
        setColumnWidth(columnIndex: number, width: number, unit?: string, minWidth?: number): void;
        /**
         * Changement des marges d'une colonne de la grille
         *
         * @instance
         * @public
         * @this GridControls._BaseGrid
         * @memberof GridControls._BaseGrid
         * @param   {number}    columnIndex    
         * @param   {number}    marginLeft     
         * @param   {number}    marginRight
         * @return  {void}
         */
        setColumnMargins(columnIndex: number, marginLeft: number, marginRight: number): void;
        /**
         * Changement de la hauteur d'une ligne de la grille
         *
         * @instance
         * @public
         * @this GridControls._BaseGrid
         * @memberof GridControls._BaseGrid
         * @param   {number}    rowIndex     
         * @param   {number}    height       
         * @param   {string}    unit         
         * @param   {number}    minHeight
         * @return  {void}
         */
        setRowHeight(rowIndex: number, height: number, unit?: string, minHeight?: number): void;
        /**
         * Changement des marges d'une ligne de la grille
         *
         * @instance
         * @public
         * @this GridControls._BaseGrid
         * @memberof GridControls._BaseGrid
         * @param   {number}    rowIndex        
         * @param   {number}    marginTop       
         * @param   {number}    marginBottom
         * @return  {void}
         */
        setRowMargins(rowIndex: number, marginTop: number, marginBottom: number): void;
        _ComputeAxisRangesSize(ranges: Bridge.List$1<GridControls._GridRange>, viewPortSize: number): number;
        /**
         * Effectue, si nécessaire, un recalcul de la disposition des éléments
         *
         * @instance
         * @public
         * @this GridControls._BaseGrid
         * @memberof GridControls._BaseGrid
         * @param   {boolean}    force    Force le layouting même si ça ne semble pas nécessaire
         * @return  {void}
         */
        layout(force?: boolean): void;
        _OnWindowSizeChanged(): void;
        _OnViewportScrollChanged(e: Event): void;
        _BindEvents(): void;
        _UnbindEvents(): void;
        _SetScrollPosition(): void;
        /**
         * Force la position du scrolling horizontal
         *
         * @instance
         * @public
         * @this GridControls._BaseGrid
         * @memberof GridControls._BaseGrid
         * @param   {number}    offset    Offset horizontal, en pixels
         * @return  {void}
         */
        setHScrollPosition(offset: number): void;
        /**
         * Force la position du scrolling vertical
         *
         * @instance
         * @public
         * @this GridControls._BaseGrid
         * @memberof GridControls._BaseGrid
         * @param   {number}    offset    Offset vertical, en pixels
         * @return  {void}
         */
        setVScrollPosition(offset: number): void;
        /**
         * Retire le contrôle du DOM sans le détruire
         *
         * @instance
         * @public
         * @override
         * @this GridControls._BaseGrid
         * @memberof GridControls._BaseGrid
         * @return  {void}
         */
        detach(): void;
        /**
         * Rattache à grille au DOM
         *
         * @instance
         * @public
         * @override
         * @this GridControls._BaseGrid
         * @memberof GridControls._BaseGrid
         * @param   {HTMLElement}    host    Element existant qui contiendra la grille
         * @return  {void}
         */
        attach(host: HTMLElement): void;
        /**
         * Destruction complète de la grille
         *
         * @instance
         * @public
         * @override
         * @this GridControls._BaseGrid
         * @memberof GridControls._BaseGrid
         * @return  {void}
         */
        destroy(): void;
    }
    export interface _BaseGridFunc extends Function {
        prototype: _BaseGrid;
    }
    var _BaseGrid: _BaseGridFunc;

    export interface _LayerItem extends GridControls.ItemPosition {
        layer: GridControls._GridLayer;
        element: HTMLElement;
        data: Object;
        computedMarginPct: number;
        computedWidthPct: number;
        groupCount: number;
        groupIndex: number;
        onCreated: {(arg: GridControls._GridLayer): void};
        onLayout: {(arg: GridControls._GridLayer): void};
        cells: Bridge.List$1<GridControls._GridItemCell>;
        getRangeStart(): number;
        getRangeEnd(): number;
        /**
         * MÉTHODE À USAGE INTERNE UNIQUEMENT
         *
         * @instance
         * @public
         * @this GridControls._LayerItem
         * @memberof GridControls._LayerItem
         * @return  {void}
         */
        dispose(): void;
    }
    export interface _LayerItemFunc extends Function {
        prototype: _LayerItem;
        new (layer: GridControls._GridLayer): _LayerItem;
    }
    var _LayerItem: _LayerItemFunc;

    export interface Action_Click extends GridControls.Action_ClickBase {
        getPressDelayMax(): number;
        getPressDelayMin(): number;
        getReleaseDelayMin(): number;
        getNumClicks(): number;
        getDelayBetweenClicksMax(): number;
    }
    export interface Action_ClickFunc extends Function {
        prototype: Action_Click;
        new (surface: HTMLElement): Action_Click;
    }
    var Action_Click: Action_ClickFunc;

    export interface Action_DoubleClick extends GridControls.Action_ClickBase {
        getPressDelayMax(): number;
        getPressDelayMin(): number;
        getReleaseDelayMin(): number;
        getNumClicks(): number;
        getDelayBetweenClicksMax(): number;
    }
    export interface Action_DoubleClickFunc extends Function {
        prototype: Action_DoubleClick;
        new (surface: HTMLElement): Action_DoubleClick;
    }
    var Action_DoubleClick: Action_DoubleClickFunc;

    export interface Action_LongClick extends GridControls.Action_ClickBase {
        getPressDelayMax(): number;
        getPressDelayMin(): number;
        getReleaseDelayMin(): number;
        getNumClicks(): number;
        getDelayBetweenClicksMax(): number;
    }
    export interface Action_LongClickFunc extends Function {
        prototype: Action_LongClick;
        new (surface: HTMLElement): Action_LongClick;
    }
    var Action_LongClick: Action_LongClickFunc;

    export interface _SchedulerMoveItem extends GridControls._SchedulerMouseAction {
        _actionData: GridControls.SchedulerMoveItemsEventArgs;
        _ProcessMouseMoveEvent(evt: any): boolean;
        getComparisonString(): string;
        _Initialize(evt: any): void;
        _OnStop(): void;
        _SetActionData(data: Object): void;
    }
    export interface _SchedulerMoveItemFunc extends Function {
        prototype: _SchedulerMoveItem;
        new (): _SchedulerMoveItem;
    }
    var _SchedulerMoveItem: _SchedulerMoveItemFunc;

    export interface SchedulerDataSourceOptions {
        /**
         * URL où télécharger les en-têtes de calendrier (employés, ressources, ...)
         Si vide les calendriers ne seront pas chargés automatiquement
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerDataSourceOptions
         * @type string
         */
        calendarsUrl: string;
        /**
         * [REQUIS] string LoadItemsUrlBuilder(LoadItemsUrlBuilderEventArgs) : callback qui construit l'url utilisée pour télécharger les éléments de RDV au format JSON
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerDataSourceOptions
         * @type System.Func
         */
        loadItemsUrlBuilder: {(arg: GridControls.LoadItemsUrlBuilderEventArgs): string};
        /**
         * [REQUIS] champ qui contient l'ID de l'élément
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerDataSourceOptions
         * @type string
         */
        itemIDField: string;
        /**
         * [REQUIS] champ qui contient la date et l'heure de l'élémnt, de type DateTime
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerDataSourceOptions
         * @type string
         */
        itemDateField: string;
        /**
         * [REQUIS] champ qui contient la durée
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerDataSourceOptions
         * @type string
         */
        itemDurationField: string;
        /**
         * [REQUIS] champ de l'élément qui contient la clé étrangère vers le calendrier associé
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerDataSourceOptions
         * @type string
         */
        itemCalendarField: string;
        /**
         * champ avec une liste de classes CSS à appliquer l'élémnt
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerDataSourceOptions
         * @type string
         */
        itemCssClassField: string;
        /**
         * champ avec un identifiant (quelconque) de calque sur lequel poserl'élément
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerDataSourceOptions
         * @type string
         */
        itemLayerField: string;
        /**
         * champ avec un identifiant (quelconque) de groupe (comme l'identifiant de rendez-vous du client et non du service)
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerDataSourceOptions
         * @type string
         */
        itemGroupField: string;
        /**
         * [REQUIS] champ qui contient l'ID du calendrier
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerDataSourceOptions
         * @type string
         */
        calendarIDField: string;
        /**
         * [facultatif] champ qui contient une chaine indiquant si la colonne est épinglée à gauche (left), à droite (right) ou pas du tout (vide)
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerDataSourceOptions
         * @type string
         */
        calendarPinnedField: string;
        /**
         * Callback. OnItemsDownloaded(object[]) est appelé lorsque le contrôle a chargé des données de rendez-vous
         Permet de filtrer/transformer les éléments avant qu'ils ne soient interprêtés.
         La callback ne doit pas modifier le tableau d'objets passé en paramètre mais retourner une nouvelle instance
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerDataSourceOptions
         * @type System.Func
         */
        onItemsDownloaded: {(arg: Object[]): Object[]};
        /**
         * Callback. OnCalendarsDownloaded(object[]) est appelé lorsque le contrôle a chargé les en-têtes de calendrier (employés, ...)
         Permet de filtrer/transformer les éléments avant qu'ils ne soient interprêtés.
         La callback ne doit pas modifier le tableau d'objets passé en paramètre mais retourner une nouvelle instance
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerDataSourceOptions
         * @type System.Func
         */
        onCalendarsDownloaded: {(arg: Object[]): Object[]};
        /**
         * Nombre de jours affichés dans chacun des calendriers exploitant ce datasource
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerDataSourceOptions
         * @default 1
         * @type number
         */
        numberOfVisibleDays: number;
    }
    export interface SchedulerDataSourceOptionsFunc extends Function {
        prototype: SchedulerDataSourceOptions;
        new (): SchedulerDataSourceOptions;
    }
    var SchedulerDataSourceOptions: SchedulerDataSourceOptionsFunc;

    export interface SchedulerDataSource {
        getCalendars(): GridControls._CalendarDataObject[];
        getActiveDates(): Date[];
        suspendAllLayouts(): void;
        resumeAllLayouts(): void;
        _UpdateItemObject(item: GridControls._SchedulerItem): void;
        /**
         * Renvoie la liste des éléments ayant le même ID de groupe que l'élément fourni
         *
         * @instance
         * @public
         * @this GridControls.SchedulerDataSource
         * @memberof GridControls.SchedulerDataSource
         * @param   {Object}            item    Element de référence
         * @return  {Array.<Object>}
         */
        getGroupItems(item: Object): Object[];
        /**
         * Renvoie la liste des éléments ayant le même ID de groupe que celui passé en paramètre
         *
         * @instance
         * @public
         * @this GridControls.SchedulerDataSource
         * @memberof GridControls.SchedulerDataSource
         * @param   {string}            group    Identifiant de groupe
         * @return  {Array.<Object>}
         */
        getGroupItemsFromGroupID(group: string): Object[];
        refresh(iDsToReload: string[], iDsToRemove: string[], onReloadComplete?: {(): void}): void;
        _DownloadItems$1(itemsIDs: string[], onReloadComplete?: {(): void}): void;
        _DownloadItems(url: string, queryData?: Object, onSuccess?: {(arg: GridControls.SchedulerDataSource): void}, onError?: {(arg: GridControls.SchedulerDataSource): void}, onDownloaded?: {(arg1: GridControls.SchedulerDataSource, arg2: boolean): void}, cacheDate?: Date): void;
        downloadItems(dateFrom: Date, dateTo: Date, uriBuilderTag?: Object, queryData?: Object, forceDownload?: boolean, onSuccess?: {(arg: GridControls.SchedulerDataSource): void}, onError?: {(arg: GridControls.SchedulerDataSource): void}): void;
        getJSON(url: string, querydata: Object, onCompletedCallBack: {(arg1: Object, arg2: string, arg3: any): void}): any;
        _OnItemsDownloaded(data: Object, status: string, xhr: any, onSuccess?: {(arg: GridControls.SchedulerDataSource): void}, onError?: {(arg: GridControls.SchedulerDataSource): void}, onDownloaded?: {(arg1: GridControls.SchedulerDataSource, arg2: boolean): void}, cacheDate?: Date): void;
        _BindItem(item: GridControls._SchedulerItem, o: any, defaultLayer?: string): void;
        _NotifyItemsChanged(added: Bridge.IEnumerable$1<GridControls._SchedulerItem>, updated: Bridge.IEnumerable$1<GridControls._SchedulerItem>, removed: Bridge.IEnumerable$1<GridControls._SchedulerItem>, receiver?: GridControls._ISchedulerDataReceiver): void;
        addOrUpdateItems(items: Object[], defaultLayer?: string): void;
        _IncrementAjaxRequestCount(step: number, date?: Date): void;
        _Register(receiver: GridControls._ISchedulerDataReceiver): void;
        _ResizeItem(evt: any): boolean;
        _Unregister(receiver: GridControls._ISchedulerDataReceiver): void;
        /**
         * Ajout manuel de calendriers
         *
         * @instance
         * @public
         * @this GridControls.SchedulerDataSource
         * @memberof GridControls.SchedulerDataSource
         * @param   {Array.<Object>}    objects
         * @return  {void}
         */
        addCalendars(objects: Object[]): void;
        _RaiseError(error: GridControls.SchedulerErrors, message: string, data: string): void;
        _AddCalendarsObjects(calendars: Object[]): void;
        /**
         * Lecture de calendriers depuis une URL
         *
         * @instance
         * @public
         * @this GridControls.SchedulerDataSource
         * @memberof GridControls.SchedulerDataSource
         * @param   {string}           url          
         * @param   {Object}           queryData    
         * @param   {System.Action}    onSuccess    
         * @param   {System.Action}    onError
         * @return  {void}
         */
        downloadCalendars(url: string, queryData?: Object, onSuccess?: {(arg: GridControls.SchedulerDataSource): void}, onError?: {(arg: GridControls.SchedulerDataSource): void}): void;
        /**
         * Informe le contrôle qu'un élément a été ajouté ou modifié
         *
         * @instance
         * @public
         * @this GridControls.SchedulerDataSource
         * @memberof GridControls.SchedulerDataSource
         * @param   {object}    item
         * @return  {void}
         */
        addOrUpdateItem(item: any): void;
        removeItem(item: any): void;
        getItemID(item: any): string;
        getItemFromID(id: string): Object;
        getItemElementsFromSchedulers(item: Object): HTMLElement[];
        dispose(): void;
    }
    export interface SchedulerDataSourceFunc extends Function {
        prototype: SchedulerDataSource;
        new (options: GridControls.SchedulerDataSourceOptions): SchedulerDataSource;
        create(options: GridControls.SchedulerDataSourceOptions): GridControls.SchedulerDataSource;
    }
    var SchedulerDataSource: SchedulerDataSourceFunc;

    export interface LoadItemsUrlBuilderEventArgs {
        loadFrom: Date;
        loadTo: Date;
        tag: Object;
        items: string[];
    }
    export interface LoadItemsUrlBuilderEventArgsFunc extends Function {
        prototype: LoadItemsUrlBuilderEventArgs;
        new (): LoadItemsUrlBuilderEventArgs;
    }
    var LoadItemsUrlBuilderEventArgs: LoadItemsUrlBuilderEventArgsFunc;

    export interface _ActionReconizerSequenceElement {
        date: number;
        originalEvent: UIEvent;
        state: GridControls._ActionReconizerState;
        pageX: number;
        pageY: number;
    }
    export interface _ActionReconizerSequenceElementFunc extends Function {
        prototype: _ActionReconizerSequenceElement;
        new (): _ActionReconizerSequenceElement;
    }
    var _ActionReconizerSequenceElement: _ActionReconizerSequenceElementFunc;

    export enum _ActionReconizerState {
        down = 0,
        move = 1,
        up = 2
    }

    export interface _GridElement {
        iD: number;
        getHashCode(): number;
        equals(o: Object): boolean;
        toString(): string;
    }
    export interface _GridElementFunc extends Function {
        prototype: _GridElement;
        new (): _GridElement;
    }
    var _GridElement: _GridElementFunc;

    export interface _CalendarDataObject {
        iD: string;
        pinned: GridControls._PinSide;
        calendarObject: Object;
        receivedOrder: number;
        dayIndex: number;
        clone(): GridControls._CalendarDataObject;
    }
    export interface _CalendarDataObjectFunc extends Function {
        prototype: _CalendarDataObject;
        new (): _CalendarDataObject;
    }
    var _CalendarDataObject: _CalendarDataObjectFunc;

    export interface _CompositeGridScrollBinding {
        destinationID: string;
        horizontal: boolean;
    }
    export interface _CompositeGridScrollBindingFunc extends Function {
        prototype: _CompositeGridScrollBinding;
        new (): _CompositeGridScrollBinding;
    }
    var _CompositeGridScrollBinding: _CompositeGridScrollBindingFunc;

    export interface _GridLog {
    }
    export interface _GridLogFunc extends Function {
        prototype: _GridLog;
        new (): _GridLog;
        trace(element: GridControls._GridElement, message: string): void;
        startChrono(element: GridControls._GridElement): void;
        endChrono(element: GridControls._GridElement, message?: string): void;
        displayChrono(element: GridControls._GridElement, message?: string): void;
    }
    var _GridLog: _GridLogFunc;

    export interface _ISchedulerDataReceiver {
        get_DateFilter(): Date;
        getNumberOfVisibleDays(): number;
        get_InteractiveSurface(): HTMLElement;
        _OnCalendarsAdded(calendars: GridControls._CalendarDataObject[]): void;
        _IncrementAjaxRequestCount(step: number): void;
        _OnItemsChanged(added: GridControls._SchedulerItem[], updated: GridControls._SchedulerItem[], removed: GridControls._SchedulerItem[]): void;
        _UpdateVisibleCalendars(visibleCalendars: string[]): void;
        suspendLayout(): void;
        resumeLayout(): void;
    }
    var _ISchedulerDataReceiver: Function;

    export enum _PinSide {
        none = 0,
        left = 1,
        right = 2
    }

    export interface _SchedulerItem {
        _InternalID: number;
        itemObject: Object;
        itemID: string;
        calendarID: string;
        duration: number;
        cssClasses: string[];
        itemDate: Date;
        itemLayerName: string;
        groupID: string;
        _LastUpdate: Date;
        _RangeIndex: number;
        _OldRangeIndex: number;
        copyTo(destination?: GridControls._SchedulerItem): GridControls._SchedulerItem;
    }
    export interface _SchedulerItemFunc extends Function {
        prototype: _SchedulerItem;
        new (): _SchedulerItem;
        _NextInternalID: number;
    }
    var _SchedulerItem: _SchedulerItemFunc;

    export interface _SchedulerLayoutElement {
        x: number;
        y: number;
        grid: GridControls.Grid;
        layersID: Bridge.List$1<number>;
        container: HTMLElement;
        horizontalGridLinesLayerID: number;
        verticalGridLinesLayerID: number;
        layersByName: Bridge.Dictionary$2<string,number>;
        /**
         * Premier calque (souvent il n'y en a qu'un)
         *
         * @instance
         * @public
         * @this GridControls._SchedulerLayoutElement
         * @memberof GridControls._SchedulerLayoutElement
         * @function getLayerID
         * @return  {number}
         */
        /**
         * Premier calque (souvent il n'y en a qu'un)
         *
         * @instance
         * @function setLayerID
         */
        getLayerID(): number;
    }
    export interface _SchedulerLayoutElementFunc extends Function {
        prototype: _SchedulerLayoutElement;
        new (): _SchedulerLayoutElement;
    }
    var _SchedulerLayoutElement: _SchedulerLayoutElementFunc;

    export interface _SchedulerMouseAction {
        _SourceScheduler: GridControls.Scheduler;
        _CurrentScheduler: GridControls.Scheduler;
        _Stop(): GridControls._SchedulerMouseAction;
        _OnStop(): void;
        _Initialize(evt: any): void;
        _CanChangeApppintment(timeRanges: GridControls.CalendarTimeRange[], calendarID: string, date: Date, duration: number): boolean;
        rollback(): void;
        _ProcessMouseMoveEvent(evt: any): boolean;
        _OnMouseEvent(evt: any): GridControls._SchedulerMouseAction;
        _Dispose(): void;
    }
    export interface _SchedulerMouseActionFunc extends Function {
        prototype: _SchedulerMouseAction;
        _Create<T>(T: {prototype: T}, scheduler: GridControls.Scheduler, items: Object[], evt: any, actionData: Object): T;
    }
    var _SchedulerMouseAction: _SchedulerMouseActionFunc;

    export interface _SchedulerMouseOptions {
        /**
         * Délai d'affichage des tooltips, en millisecondes
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerMouseOptions
         * @default 500
         * @type number
         */
        tooltipDelay: number;
        /**
         * Délai entre deux clics
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerMouseOptions
         * @default 250
         * @type number
         */
        doubleClickDelay: number;
        /**
         * Ecart maximum autorisé entre deux clics, en pixels, pour que ça soit considéré comme un double clic
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerMouseOptions
         * @default 10
         * @type number
         */
        doubleClicDistance: number;
        nonClickableCssClasses: string;
    }
    export interface _SchedulerMouseOptionsFunc extends Function {
        prototype: _SchedulerMouseOptions;
        new (): _SchedulerMouseOptions;
    }
    var _SchedulerMouseOptions: _SchedulerMouseOptionsFunc;

    export interface _SchedulerOptionsCallbacks {
        /**
         * GetItemHtmlTemplate(Scheduler, string layerName, object) : fonction qui renvoie le contenu html d'un élément de RDV
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerOptionsCallbacks
         * @type GridControls.SchedulerGetItemTemplateDelegate
         */
        getItemHtmlTemplate: {(scheduler: GridControls.Scheduler, layerName: string, itemObject: any): string};
        /**
         * OnError(SchedulerErrorEventArgs) : en cas d'erreur quelconque, le paramètre fournit des informations sur l'erreur
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerOptionsCallbacks
         * @type System.Action
         */
        onError: {(arg: GridControls.SchedulerErrorEventArgs): void};
        /**
         * OnAjaxRequest(Scheduler, bool) : le booléen en paramètre indique s'il y a des requêtes ajax en cours ou pas
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerOptionsCallbacks
         * @type GridControls.SchedulerOnAjaxRequestDelegate
         */
        onAjaxRequest: {(scheduler: GridControls.Scheduler, runningRequest: boolean): void};
        /**
         * OnDateChanged(cheduler, DateTime, DateTime) : appelé lorsque la date représentée a changé
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerOptionsCallbacks
         * @type GridControls.SchedulerOnDateChangedDelegate
         */
        onDateChanged: {(scheduler: GridControls.Scheduler, date: Date): void};
        /**
         * OnTimeChanged(Scheduler, string) : appelé après que la ligne du temps ait été positionnée. l'heure passée sous forme de chaine est correctement formattée
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerOptionsCallbacks
         * @type GridControls.SchedulerOnTimeChangedDelegate
         */
        onTimeChanged: {(scheduler: GridControls.Scheduler, formatedTime: string): void};
        /**
         * OnClick(SchedulerMouseEventArg evt) : un clic a été fait. peut être suivi d'un double-clic
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerOptionsCallbacks
         * @type GridControls.SchedulerOnClickDelegate
         */
        onClick: {(arg: GridControls.SchedulerMouseEventArgs): void};
        /**
         * OnDoubleClick(SchedulerMouseEventArg evt) : un double-clic a été fait
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerOptionsCallbacks
         * @type GridControls.SchedulerOnClickDelegate
         */
        onDoubleClick: {(arg: GridControls.SchedulerMouseEventArgs): void};
        /**
         * PrepareMoveItems(_SchedulerMoveItemsEventArgs arg) : appelé pour connaitre la liste des éléments à déplacer lorsque l'utilisateur se prépare à déplacer un RDV.
         Si les plages horaires autorisées (AllowedTimeRanges[]) sont à null il n'y a aucune contraine.
         La liste du/des éléments de RDV à déplacer DOIT être renseignée (ItemsToMove[])
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerOptionsCallbacks
         * @type System.Action
         */
        prepareMoveItems: {(arg: GridControls.SchedulerMoveItemsEventArgs): void};
        /**
         * PrepareResizeItem(SchedulerResizeItemEventArgs arg) : infos sur le changement de durée de l'élément sélectionné
         Si les plages horaires autorisées (AllowedTimeRanges[]) sont à null il n'y a aucune contraine.
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerOptionsCallbacks
         * @type System.Action
         */
        prepareResizeItem: {(arg: GridControls.SchedulerResizeItemEventArgs): void};
        /**
         * OnItemChanged(Scheduler scheduler, object[] items) : fait suite au déplacement/resize d'éléments
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerOptionsCallbacks
         * @type System.Action
         */
        onItemsChanged: {(arg1: GridControls.Scheduler, arg2: Object): void};
        onMoveItemsStopped: {(arg1: GridControls.Scheduler, arg2: Object): void};
        onResizeItemsStopped: {(arg1: GridControls.Scheduler, arg2: Object): void};
    }
    export interface _SchedulerOptionsCallbacksFunc extends Function {
        prototype: _SchedulerOptionsCallbacks;
        new (): _SchedulerOptionsCallbacks;
    }
    var _SchedulerOptionsCallbacks: _SchedulerOptionsCallbacksFunc;

    export interface _SchedulerOptionsLayout {
        cellWidth: number;
        cellWidthUnit: string;
        minCellsWidth: number;
        cellHeight: number;
        cellHeightUnit: string;
        minRowsHeight: number;
        columnsHeaderHeight: number;
        rowsHeaderWidth: number;
        /**
         * Taille de la séparation entre deux jours
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerOptionsLayout
         * @default 3
         * @type number
         */
        daysSeparationSize: number;
        /**
         * Place les heures en colonne plutôt qu'en live
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerOptionsLayout
         * @default false
         * @type boolean
         */
        inverseDirection: boolean;
    }
    export interface _SchedulerOptionsLayoutFunc extends Function {
        prototype: _SchedulerOptionsLayout;
        new (): _SchedulerOptionsLayout;
    }
    var _SchedulerOptionsLayout: _SchedulerOptionsLayoutFunc;

    export interface _SchedulerOptionsTemplates {
        /**
         * Contenu HTML à placer pour dessiner les traits vetrticaux des colonnes
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerOptionsTemplates
         * @type string
         */
        columnsHtmlContent: string;
        /**
         * Contenu HTML à placer pour dessiner les traits horizontaux des lignes
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerOptionsTemplates
         * @type string
         */
        rowsHtmlContent: string;
        /**
         * Callback (int) pour récupérer le template des en-têtes des heures
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerOptionsTemplates
         * @type System.Func
         */
        hoursTemplate: {(arg: number): string};
        /**
         * string html = Callback (object) pour récupérer le template des en-têtes des calendriers
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerOptionsTemplates
         * @type System.Func
         */
        calendarsTemplate: {(arg: any): string};
        /**
         * string html = Callback (object, dayIndex) pour récupérer le template des en-têtes des calendriers avec un offset de jour
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerOptionsTemplates
         * @type System.Func
         */
        calendarsTemplate2: {(arg1: Object, arg2: number): string};
    }
    export interface _SchedulerOptionsTemplatesFunc extends Function {
        prototype: _SchedulerOptionsTemplates;
        new (): _SchedulerOptionsTemplates;
    }
    var _SchedulerOptionsTemplates: _SchedulerOptionsTemplatesFunc;

    export enum Axis {
        row = 0,
        column = 1
    }

    /**
     * Définition d'une tranche horaire pour un calendrier
     *
     * @public
     * @class GridControls.CalendarTimeRange
     */
    export interface CalendarTimeRange {
        /**
         * Date (sans heure) pour laquelle cette plage horaire est valable
         *
         * @instance
         * @public
         * @memberof GridControls.CalendarTimeRange
         * @type Date
         */
        date: Date;
        /**
         * Identifiant du calendrier
         *
         * @instance
         * @public
         * @memberof GridControls.CalendarTimeRange
         * @type string
         */
        calendarID: string;
        /**
         * Heure de début
         *
         * @instance
         * @public
         * @memberof GridControls.CalendarTimeRange
         * @type number
         */
        fromHour: number;
        /**
         * Minute de début
         *
         * @instance
         * @public
         * @memberof GridControls.CalendarTimeRange
         * @type number
         */
        fromMinute: number;
        /**
         * Heure de fin
         *
         * @instance
         * @public
         * @memberof GridControls.CalendarTimeRange
         * @type number
         */
        toHour: number;
        /**
         * Minute de fin
         *
         * @instance
         * @public
         * @memberof GridControls.CalendarTimeRange
         * @type number
         */
        toMinute: number;
    }
    export interface CalendarTimeRangeFunc extends Function {
        prototype: CalendarTimeRange;
        new (): CalendarTimeRange;
    }
    var CalendarTimeRange: CalendarTimeRangeFunc;

    export interface CompositeGrid {
        host: HTMLElement;
        scrollableAreaID: string;
        onGridScrolled(grid: GridControls._BaseGrid, x: number, y: number): void;
        syncHorizontalScrolling(id: string): void;
        syncVerticalScrolling(id: string): void;
        destroy(): void;
    }
    export interface CompositeGridFunc extends Function {
        prototype: CompositeGrid;
        new (host: HTMLElement): CompositeGrid;
    }
    var CompositeGrid: CompositeGridFunc;

    export interface GridCustomizeItem {
        itemData: Object;
        position: GridControls.ItemPosition;
        cssClasses: string[];
        htmlContent: string;
        /**
         * ID interne de l'élément ajouté
         *
         * @instance
         * @public
         * @memberof GridControls.GridCustomizeItem
         * @type number
         */
        _LayerItemID: number;
        _Element: HTMLElement;
    }
    export interface GridCustomizeItemFunc extends Function {
        prototype: GridCustomizeItem;
        new (): GridCustomizeItem;
    }
    var GridCustomizeItem: GridCustomizeItemFunc;

    export interface GridOptions {
        onScrollChanged: {(arg1: GridControls._BaseGrid, arg2: HTMLElement): void};
        onLayout: {(arg: GridControls._BaseGrid): void};
        scrollDisabled: boolean;
        _AutoLayout: boolean;
    }
    export interface GridOptionsFunc extends Function {
        prototype: GridOptions;
        new (): GridOptions;
        bindCustomScrollbars: {(arg: HTMLElement): void};
        updateCustomScrollbars: {(arg: HTMLElement): void};
        unbindCustomScrollbars: {(arg: HTMLElement): void};
    }
    var GridOptions: GridOptionsFunc;

    export interface HtmlElementHelper {
    }
    export interface HtmlElementHelperFunc extends Function {
        prototype: HtmlElementHelper;
        new (): HtmlElementHelper;
        setTransform(element: HTMLElement, transform: string): void;
    }
    var HtmlElementHelper: HtmlElementHelperFunc;

    export interface Scheduler extends GridControls._BaseControl,GridControls._ISchedulerDataReceiver {
        get_ControlElement(): HTMLElement;
        get_InteractiveSurface(): HTMLElement;
        get_DateFilter(): Date;
        getNumberOfVisibleDays(): number;
        setDataSource(dataSource: GridControls.SchedulerDataSource): void;
        _SetupScrollSync(grid: GridControls.Grid, x: number, y: number): void;
        _GetLayoutElement(x: number, y: number): GridControls._SchedulerLayoutElement;
        /**
         * Ajout du calque avec les traits horizontaux/verticaux de la grille
         *
         * @instance
         * @public
         * @this GridControls.Scheduler
         * @memberof GridControls.Scheduler
         * @param   {string}    cssClass
         * @return  {void}
         */
        addGridLinesLayer(cssClass?: string): void;
        /**
         * Ajout d'un calque conteneur pour les éléments de rendez-vous
         *
         * @instance
         * @public
         * @this GridControls.Scheduler
         * @memberof GridControls.Scheduler
         * @param   {string}            name                  identifiant du calque
         * @param   {Array.<string>}    cssClasses            classes CSS à appliquer
         * @param   {boolean}           overlappingEnabled    superposition des éléments autorisée
         * @param   {number}            itemsPaddingStart     déclaage de début
         * @param   {number}            itemsPaddingEnd       déclagae de fin
         * @return  {void}
         */
        addItemsLayer(name: string, cssClasses: string[], overlappingEnabled?: boolean, itemsPaddingStart?: number, itemsPaddingEnd?: number): void;
        getEmptySpaceElement(): HTMLElement;
        suspendLayout(): void;
        resumeLayout(): void;
        layout(force?: boolean): void;
        _AddGridLines(grid: GridControls.Grid, layerID: number, offset: number, count: number, template: string, cssClass?: string): void;
        _AddGridLines$1(grid: GridControls.Grid, layerID: number, offset: number, objects: Object[], template: string, cssClass?: string, cssClassSelector?: {(arg: Object): string}): void;
        _SyncScrollers(grid: GridControls._BaseGrid, sourceX: number, sourceY: number, offsetX: number, offsetY: number): void;
        createHoursRanges(): void;
        _RaiseError(error: GridControls.SchedulerErrors, message: string, data: string): void;
        _AddCalendars(sourceCalendars: GridControls._CalendarDataObject[], _rangeIndex: number): void;
        setViewDate(date: Date): void;
        _GetLayoutElementFromItem(item: GridControls._SchedulerItem, oldRangeIndex?: boolean): GridControls._SchedulerLayoutElement;
        _GetLayoutElementLayerFromItem(item: GridControls._SchedulerItem): number;
        getItemContainer(item: Object): HTMLElement;
        _UpdateVisibleItems(): void;
        _SetItemPosition(gc: GridControls.GridCustomizeItem): boolean;
        destroy(): void;
        attach(host: HTMLElement): void;
        detach(): void;
        _UpdateCurrentTimeElement(): void;
        _UpdateCurrentTimeElementEx(setTimeout?: boolean): void;
        _FindItemFromElement(e: HTMLElement): GridControls._SchedulerItem;
        _BindEvents(): void;
        _CompleteMouseEvent(evt: any): void;
        _BeginMoveResizeItem(evt: any): boolean;
        _GetResizeCursor(): String;
        _SetCurrentCursor(evt: any): void;
        _MoveResizeItem(evt: any): boolean;
        _UnbindEvents(): void;
        _RaiseMouseClickEvent(evt: any, callback: {(arg: GridControls.SchedulerMouseEventArgs): void}, clickedHtmlElements: Bridge.List$1<HTMLElement>): void;
        _OnClick(e: any): boolean;
        _GetHOverItem(): GridControls._SchedulerItem;
        _GetHOverItems(evt: any): Object[];
        _GetSchedulerPositionFromClientCoordinates(clientX: number, clientY: number, calendarID: {v: string}, hour: {v: number}, minute: {v: number}, dayIndex: {v: number}): boolean;
        _MakeSchedulerMouseEventArgs(evt: any, clickedHtmlElements: Bridge.List$1<HTMLElement>): GridControls.SchedulerMouseEventArgs;
        _IsPointInElementRect(element: HTMLElement, viewportX: number, viewportY: number): boolean;
        _GetHOverGridItems(viewportX: number, viewportY: number): Bridge.List$1<HTMLElement>;
        _GetHOverHtmlELements(root: HTMLElement, viewportX: number, viewportY: number): Bridge.List$1<HTMLElement>;
        _OnCalendarsAdded(calendars: GridControls._CalendarDataObject[]): void;
        _IncrementAjaxRequestCount(step: number): void;
        _OnItemsChanged(added: GridControls._SchedulerItem[], updated: GridControls._SchedulerItem[], removed: GridControls._SchedulerItem[]): void;
        _ShowHideResource(layoutIndex: number, resourceIndex: number, hidden: boolean): void;
        autoFitResources(): void;
        _SetResourceMargins(layoutIndex: number, resourceIndex: number, start: number, end: number): void;
        /**
         * Définition des marges (extérieures) d'une ressource
         *
         * @instance
         * @public
         * @this GridControls.Scheduler
         * @memberof GridControls.Scheduler
         * @param   {string}     calendarID     ID de la ressource
         * @param   {number}     marginStart    marge de début, en pixels
         * @param   {number}     marginEnd      marge de fin, en pixels
         * @param   {number}     dayOffset      décalage du jour
         * @param   {boolean}    autoLayout     true/false
         * @return  {void}
         */
        setCalendarMargins(calendarID: string, marginStart: number, marginEnd: number, dayOffset?: number, autoLayout?: boolean): void;
        _UpdateVisibleCalendars(visibleCalendarsSource: string[]): void;
    }
    export interface SchedulerFunc extends Function {
        prototype: Scheduler;
        /**
         * Crée une nouvelle instance du contrôle
         *
         * @static
         * @public
         * @this GridControls.Scheduler
         * @memberof GridControls.Scheduler
         * @param   {GridControls.SchedulerOptions}    options    Options du contrôle
         * @return  {GridControls.Scheduler}
         */
        create(options: GridControls.SchedulerOptions): GridControls.Scheduler;
    }
    var Scheduler: SchedulerFunc;

    /**
     * Grille générique permettant d'afficher tout et n'importe quoi
     *
     * @public
     * @class GridControls.Grid
     * @augments GridControls._BaseGrid
     */
    export interface Grid extends GridControls._BaseGrid {
        /**
         * Ajout d'une colonne à la grille
         *
         * @instance
         * @public
         * @this GridControls.Grid
         * @memberof GridControls.Grid
         * @param   {Object}    data                Données utilisateur
         * @param   {number}    width               Largeur (numérique)
         * @param   {string}    unit                Unité (% ou px)
         * @param   {number}    minWidthInPixels    Largeur mini de la colonne, en pixels
         * @param   {number}    maxPctWidth
         * @return  {number}                        Retourne l'identifiant de la colonne
         */
        addColumn(data: Object, width: number, unit: string, minWidthInPixels?: number, maxPctWidth?: number): number;
        /**
         * Ajout d'une ligne
         *
         * @instance
         * @public
         * @this GridControls.Grid
         * @memberof GridControls.Grid
         * @param   {Object}    data                 Données utilisateur
         * @param   {number}    height               Hauteur (numérique)
         * @param   {string}    unit                 Unité (% ou px)
         * @param   {number}    minHeightInPixels    Hauteur maxi de la ligne
         * @param   {number}    maxPctHeight
         * @return  {number}                         Retourne l'identifiant de la ligne
         */
        addRow(data: Object, height: number, unit: string, minHeightInPixels?: number, maxPctHeight?: number): number;
        /**
         * Ajout d'un ensemble de colonnes, de même taille
         *
         * @instance
         * @public
         * @this GridControls.Grid
         * @memberof GridControls.Grid
         * @param   {Array.<Object>}    columns             Données utilisateur associées à chaque colonne
         * @param   {number}            width               Largeur numérique
         * @param   {string}            unit                Unité (% ou px)
         * @param   {number}            minWidthInPixels    Largeur minimale des colonnes
         * @return  {Array.<number>}                        Tableau avec les identifiants de chaque colonne ajoutée
         */
        addColumns(columns: Object[], width: number, unit: string, minWidthInPixels?: number): number[];
        /**
         * Ajout d'un ensemble de lignes, de même taille
         *
         * @instance
         * @public
         * @this GridControls.Grid
         * @memberof GridControls.Grid
         * @param   {Array.<Object>}    rows                 Données utilisateur associées à chaque colonne
         * @param   {number}            height               Hauteur numérique
         * @param   {string}            unit                 Unité (% ou px)
         * @param   {number}            minHeightInPixels    Hauteur minimale des lignes
         * @return  {Array.<number>}                         Tableau avec les identifiants de chaque ligne ajoutée
         */
        addRows(rows: Object[], height: number, unit: string, minHeightInPixels?: number): number[];
        /**
         * Création d'un nouveau calque
         *
         * @instance
         * @public
         * @this GridControls.Grid
         * @memberof GridControls.Grid
         * @param   {GridControls.Axis}    flowDirection        Direction dans laquelle les éléments peuvent s'étendre sur plusieurs cellules
         * @param   {Array.<string>}       cssClasses           
         * @param   {boolean}              overlapingEnabled    
         * @param   {number}               itemsPaddingStart    
         * @param   {number}               itemsPaddingEnd
         * @return  {number}                                    Identifiant du calque
         */
        addLayer(flowDirection: GridControls.Axis, cssClasses?: string[], overlapingEnabled?: boolean, itemsPaddingStart?: number, itemsPaddingEnd?: number): number;
        /**
         * Vide tous les éléments d'un calque
         *
         * @instance
         * @public
         * @this GridControls.Grid
         * @memberof GridControls.Grid
         * @param   {number}    layerID
         * @return  {void}
         */
        removeAllLayerItems(layerID: number): void;
        /**
         * Ajout d'un ensemble d'éléments dans un calque
         *
         * @instance
         * @public
         * @this GridControls.Grid
         * @memberof GridControls.Grid
         * @param   {number}            layerID              identifiant du calque
         * @param   {Array.<Object>}    items                Objets utilisateur à associer à chaque nouvel élément
         * @param   {System.Func}       customizeCallback    Callback obligatoire de positionnement et de personnalisation
         * @return  {Array.<number>}
         */
        addItems(layerID: number, items: Object[], customizeCallback: {(arg: GridControls.GridCustomizeItem): boolean}): number[];
        updateItemPosition(layerID: number, itemID: number, itemobject: any, customizeCallback: {(arg: GridControls.GridCustomizeItem): boolean}): void;
        _RemoveItemFromLayers(itemID: number): HTMLElement;
        /**
         * Suppression d'un calque
         *
         * @instance
         * @public
         * @this GridControls.Grid
         * @memberof GridControls.Grid
         * @param   {GridControls._GridLayer}    layer    identifiant du calque à supprimer
         * @return  {boolean}                             booléen indiquant si l'opération a réussi
         */
        removeLayer(layer: GridControls._GridLayer): boolean;
    }
    export interface GridFunc extends Function {
        prototype: Grid;
        /**
         * Création d'une instance de contrôle Grid
         *
         * @instance
         * @public
         * @this GridControls.Grid
         * @memberof GridControls.Grid
         * @param   {GridControls.GridOptions}    options       Options facultatives pour la création du contrôle
         * @param   {string}                      identifier
         * @return  {void}
         */
        new (options: GridControls.GridOptions, identifier: string): Grid;
        /**
         * Création d'une nouelle instance du contrôle Grid
         *
         * @static
         * @public
         * @this GridControls.Grid
         * @memberof GridControls.Grid
         * @param   {GridControls.GridOptions}    options       Options de création
         * @param   {string}                      identifier
         * @return  {GridControls.Grid}                         Istance de la classe du contrôle
         */
        create(options?: GridControls.GridOptions, identifier?: string): GridControls.Grid;
        /**
         * Essaie de retourner l'objet Grid associé à l'élément hôte référencé par le selecteur
         *
         * @static
         * @public
         * @this GridControls.Grid
         * @memberof GridControls.Grid
         * @param   {string}               selector    Element du DOM auquel on a déjà rattaché une grille
         * @return  {GridControls.Grid}                Classe Grid associée à l'élément
         */
        query$1(selector: string): GridControls.Grid;
        /**
         * Essaie de retourner l'objet Grid associé à l'élément hôte
         *
         * @static
         * @public
         * @this GridControls.Grid
         * @memberof GridControls.Grid
         * @param   {HTMLElement}          element    Element du DOM auquel on a déjà rattaché une grille
         * @return  {GridControls.Grid}               Classe Grid associée à l'élément
         */
        query(element: HTMLElement): GridControls.Grid;
    }
    var Grid: GridFunc;
}