(function (globals) {
    "use strict";

    /**
     * @memberof System
     * @callback System.Func
     * @param   {number}    arg
     * @return  {string}
     */
    
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
    
    /** @namespace System */
    
    /**
     * @memberof System
     * @callback System.Action
     * @param   {GridControls.SchedulerErrorEventArgs}    arg
     * @return  {void}
     */
    
    /** @namespace GridControls */
    
    /**
     * @memberof GridControls
     * @callback GridControls.SchedulerGetItemTemplateDelegate
     * @param   {GridControls.Scheduler}    scheduler     
     * @param   {string}                    layerName     
     * @param   {Object}                    itemObject
     * @return  {string}
     */
    
    Bridge.define('GridControls._ActionReconizer', {
        _IgnoreMouseEvents: false,
        _Sequence: null,
        _Surface: null,
        _EventHandlerMouse: null,
        _EventHandlerTouch: null,
        m_TimerID: 0,
        _Events: null,
        _BoundElement: null,
        bind: null,
        onDetected: null,
        config: {
            init: function () {
                this._Sequence = new Bridge.List$1(GridControls._ActionReconizerSequenceElement)();
                this._Events = ["touchstart", "touchmove", "touchend", "mousedown", "mousemove", "mouseup", "mouseleave", "touchcancel"];
            }
        },
        constructor: function (surface) {
            var $t;
            this._Surface = surface;
    
            this._EventHandlerMouse = Bridge.fn.bind(this, $_.GridControls._ActionReconizer.f1);
    
            this._EventHandlerTouch = $_.GridControls._ActionReconizer.f2;
    
            var jSurface = $(surface);
            $t = Bridge.getEnumerator(this._Events);
            while ($t.moveNext()) {
                var evt = $t.getCurrent();
                if (Bridge.String.startsWith(evt, "touch")) {
                    jSurface.bind(evt, this, this._EventHandlerTouch);
                }
                else  {
                    jSurface.bind(evt, this, this._EventHandlerMouse);
                }
            }
    
            this.m_TimerID = window.setInterval(Bridge.fn.bind(this, this._OnTimer), 50);
    },
    cancel: function () {
        this._BoundElement = null;
        this._Sequence.clear();
    },
    restart: function () {
        var last = null;
        if (this._Sequence.getCount() > 0) {
            last = Bridge.Linq.Enumerable.from(this._Sequence).last().originalEvent;
        }
        this.cancel();
        this._OnEvent(last);
    },
    _OnTimer: function () {
        this._DetectGesture(false);
    },
    destroy: function () {
        var $t;
        var jSurface = $(this._Surface);
        $t = Bridge.getEnumerator(this._Events);
        while ($t.moveNext()) {
            var evt = $t.getCurrent();
            if (Bridge.String.startsWith(evt, "touch")) {
                jSurface.unbind(evt, this._EventHandlerTouch);
            }
            else  {
                jSurface.unbind(evt, this._EventHandlerMouse);
            }
        }
    
        window.clearInterval(this.m_TimerID);
        this.m_TimerID = -1;
    
        this._Surface = null;
        this._Sequence = null;
        this._Events = null;
    },
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
    _ShouldProcessEvent: function (evt, state) {
        return true;
    },
    _OnEvent: function (evt) {
        if (!Bridge.hasValue(evt)) {
            return;
        }
    
        if (evt.type === "mouseleave" || evt.type === "touchcancel") {
            this.cancel();
            return;
        }
    
        if (this._IgnoreMouseEvents && Bridge.String.startsWith(evt.type, "mouse")) {
            return;
        }
    
        var x = evt.pageX;
        var y = evt.pageY;
        if (Bridge.String.startsWith(evt.type, "touch")) {
            this._IgnoreMouseEvents = true;
            var touches = evt.touches;
            if (!Bridge.hasValue(touches) || touches.length !== 1) {
                var originalEvent = evt.originalEvent;
                if (Bridge.hasValue(originalEvent)) {
                    evt = Bridge.cast(originalEvent, UIEvent);
                    touches = originalEvent.touches;
                }
    
                if (!Bridge.hasValue(touches) || touches.length !== 1) {
                    this.cancel();
                    return;
                }
            }
            x = touches[0].pageX;
            y = touches[0].pageY;
        }
    
        console.log("EVENT " + evt.type + " x=" + x + " y=" + y);
    
        var state = new GridControls._ActionReconizerState();
        if (Bridge.String.endsWith(evt.type, "move")) {
            state = GridControls._ActionReconizerState.move;
        }
        else  {
            if (Bridge.String.endsWith(evt.type, "down") || Bridge.String.endsWith(evt.type, "start")) {
                state = GridControls._ActionReconizerState.down;
            }
            else  {
                state = GridControls._ActionReconizerState.up;
            }
        }
    
        if (this._ShouldProcessEvent(evt, state) === false) {
            return;
        }
    
        this._Sequence.add(Bridge.merge(new GridControls._ActionReconizerSequenceElement(), {
            originalEvent: evt,
            date: Bridge.Long((new Date()).getTime()),
            pageX: evt.pageX,
            pageY: evt.pageY,
            state: state
        } ));
        this._DetectGesture(true);
    }
    });
    
    var $_ = {};
    
    Bridge.ns("GridControls._ActionReconizer", $_)
    
    Bridge.apply($_.GridControls._ActionReconizer, {
        f1: function (e) {
            this._OnEvent(e);
        },
        f2: function (e) {
            //_OnEvent(e);
        }
    });
    
    Bridge.define('GridControls._ActionReconizerSequenceElement', {
        date: Bridge.Long(0),
        originalEvent: null,
        state: 0,
        pageX: 0,
        pageY: 0
    });
    
    Bridge.define('GridControls._ActionReconizerState', {
        statics: {
            down: 0,
            move: 1,
            up: 2
        },
        $enum: true
    });
    
    Bridge.define('GridControls._GridElement', {
        statics: {
            m_NextID: 1
        },
        iD: 0,
        constructor: function () {
            this.iD = GridControls._GridElement.m_NextID;
            GridControls._GridElement.m_NextID = (GridControls._GridElement.m_NextID + 1) | 0;
        },
        getHashCode: function () {
            return this.iD;
        },
        equals: function (o) {
            if (!Bridge.hasValue(o)) {
                return false;
            }
    
            var element = Bridge.as(o, GridControls._GridElement);
            if (!Bridge.hasValue(element)) {
                return false;
            }
    
            return element.iD === this.iD;
        },
        toString: function () {
            return "[GridELement #" + this.iD.toString() + "]";
        }
    });
    
    Bridge.define('GridControls._CalendarDataObject', {
        iD: null,
        pinned: 0,
        calendarObject: null,
        receivedOrder: 0,
        dayIndex: 0,
        clone: function () {
            return Bridge.merge(new GridControls._CalendarDataObject(), {
                iD: this.iD,
                calendarObject: this.calendarObject,
                pinned: this.pinned,
                receivedOrder: this.receivedOrder,
                dayIndex: this.dayIndex
            } );
        }
    });
    
    Bridge.define('GridControls._CompositeGridScrollBinding', {
        destinationID: null,
        horizontal: false
    });
    
    Bridge.define('GridControls._GridLog', {
        statics: {
            _LogsEnabled: true,
            _Timers: null,
            config: {
                init: function () {
                    this._Timers = new Bridge.Dictionary$2(Bridge.Int32,Date)();
                }
            },
            trace: function (element, message) {
                if (false || !Bridge.hasValue(element)) {
                    return;
                }
                console.log(new Date().toDateString() + " " + new Date().toLocaleTimeString() + " " + element.toString() + " : " + message);
            },
            startChrono: function (element) {
                if (false || !Bridge.hasValue(element)) {
                    return;
                }
                GridControls._GridLog._Timers.set(element.iD, new Date());
            },
            endChrono: function (element, message) {
                if (message === void 0) { message = "end"; }
                if (false || !Bridge.hasValue(element)) {
                    return;
                }
                if (GridControls._GridLog._Timers.containsKey(element.iD) === false) {
                    return;
                }
    
                GridControls._GridLog.displayChrono(element, message);
                GridControls._GridLog._Timers.remove(element.iD);
            },
            displayChrono: function (element, message) {
                if (message === void 0) { message = "current"; }
                if (false || !Bridge.hasValue(element)) {
                    return;
                }
                if (GridControls._GridLog._Timers.containsKey(element.iD) === false) {
                    return;
                }
    
                var ms = Bridge.Math.round(Bridge.Date.subdd(new Date(), GridControls._GridLog._Timers.get(element.iD)).getTotalMilliseconds(), 0, 6);
                console.log(element.toString() + " : " + message + " (" + Bridge.Int.format(ms, 'G') + "ms)");
            }
        }
    });
    
    Bridge.define('GridControls._ISchedulerDataReceiver');
    
    Bridge.define('GridControls._PinSide', {
        statics: {
            none: 0,
            left: 1,
            right: 2
        },
        $enum: true
    });
    
    Bridge.define('GridControls._SchedulerItem', {
        statics: {
            _NextInternalID: 1
        },
        _InternalID: 0,
        itemObject: null,
        itemID: null,
        calendarID: null,
        duration: 0,
        cssClasses: null,
        itemLayerName: null,
        groupID: null,
        _RangeIndex: 0,
        _OldRangeIndex: null,
        config: {
            init: function () {
                this.itemDate = new Date(-864e13);
                this._LastUpdate = new Date() || new Date(-864e13);
            }
        },
        constructor: function () {
            this._InternalID = GridControls._SchedulerItem._NextInternalID;
            GridControls._SchedulerItem._NextInternalID = (GridControls._SchedulerItem._NextInternalID + 1) | 0;
        },
        copyTo: function (destination) {
            var $t;
            if (destination === void 0) { destination = null; }
            var item = ($t = destination, Bridge.hasValue($t) ? $t : new GridControls._SchedulerItem());
            item._InternalID = this._InternalID;
            item.itemObject = this.itemObject;
            item.itemID = this.itemID;
            item.calendarID = this.calendarID;
            item.duration = this.duration;
            item.cssClasses = Bridge.Linq.Enumerable.from(this.cssClasses).toArray();
            item.itemDate = this.itemDate;
            item.itemLayerName = this.itemLayerName;
            item.groupID = this.groupID;
            item._LastUpdate = this._LastUpdate;
            item._RangeIndex = this._RangeIndex;
    
            return item;
        }
    });
    
    Bridge.define('GridControls._SchedulerLayoutElement', {
        x: 0,
        y: 0,
        grid: null,
        layersID: null,
        container: null,
        horizontalGridLinesLayerID: -1,
        verticalGridLinesLayerID: -1,
        layersByName: null,
        config: {
            init: function () {
                this.layersID = new Bridge.List$1(Bridge.Int32)();
                this.layersByName = new Bridge.Dictionary$2(String,Bridge.Int32)();
            }
        },
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
        getLayerID: function () {
            return this.layersID.getItem(0);
        }
    });
    
    Bridge.define('GridControls._SchedulerMouseAction', {
        statics: {
            _Create: function (T, scheduler, items, evt, actionData) {
                var $t;
                if ((evt.type !== "mousedown" && evt.type !== "touchstart") || !Bridge.hasValue(items) || items.length === 0) {
                    return null;
                }
    
                var instance = new T();
    
                instance._Items = new Bridge.List$1(GridControls._SchedulerItem)();
                instance._Backup = new Bridge.List$1(GridControls._SchedulerItem)();
    
                $t = Bridge.getEnumerator(items);
                while ($t.moveNext()) {
                    var i = $t.getCurrent();
                    var id = scheduler._DataSource.getItemID(i);
                    if (Bridge.String.isNullOrEmpty(id)) {
                        continue;
                    }
    
                    if (scheduler._DataSource._Items.containsKey(id)) {
                        var sci = scheduler._DataSource._Items.get(id);
                        instance._Items.add(sci);
    
                        instance._Backup.add(sci.copyTo());
                    }
                }
    
                if (instance._Items.getCount() === 0) {
                    return null;
                }
    
                instance._SourceScheduler = scheduler;
                instance._CurrentScheduler = scheduler;
                instance._SetActionData(actionData);
    
                instance._Initialize(evt);
    
                return instance;
            }
        },
        _SourceScheduler: null,
        _CurrentScheduler: null,
        _Items: null,
        _Backup: null,
        constructor: function () {
        },
        _Stop: function () {
            this._OnStop();
            this._Dispose();
            return null;
        },
        _OnStop: function () {
        },
        _Initialize: function (evt) {
        },
        _CanChangeApppintment: function (timeRanges, calendarID, date, duration) {
            var $t;
            if (!Bridge.hasValue(timeRanges)) {
                return true;
            }
    
            $t = Bridge.getEnumerator(Bridge.Linq.Enumerable.from(timeRanges).where(function (t) {
                return t.calendarID === calendarID && Bridge.equals(new Date(t.date.getFullYear(), t.date.getMonth(), t.date.getDate()), new Date(date.getFullYear(), date.getMonth(), date.getDate()));
            }));
            while ($t.moveNext()) {
                var range = $t.getCurrent();
                var rangeFrom = new Date(date.getFullYear(), (date.getMonth() + 1) - 1, date.getDate(), range.fromHour, range.fromMinute);
                var rangeTo = new Date(date.getFullYear(), (date.getMonth() + 1) - 1, date.getDate(), range.toHour, range.toMinute);
    
                if (Bridge.Date.gte(date, rangeFrom) && Bridge.Date.lte(date, rangeTo)) {
                    var tempdate = new Date(date.valueOf() + Math.round((duration) * 6e4));
                    if (Bridge.Date.gte(tempdate, rangeFrom) && Bridge.Date.lte(tempdate, rangeTo)) {
                        return true;
                    }
                }
            }
    
            return false;
        },
        rollback: function () {
            if (!Bridge.hasValue(this._Backup)) {
                return;
            }
    
            for (var i = 0; i < this._Items.getCount(); i = (i + 1) | 0) {
                this._Backup.getItem(i).copyTo(this._Items.getItem(i));
            }
        },
        _ProcessMouseMoveEvent: function (evt) {
            return true;
        },
        _OnMouseEvent: function (evt) {
            if (!Bridge.hasValue(this._SourceScheduler)) {
                return this._Stop();
            }
    
            if (evt.type !== "mousemove" && evt.type !== "mouseup" && evt.type !== "touchmove" && evt.type !== "touchend") {
                return this._Stop();
            }
    
            if (evt.type === "mouseup" || evt.type === "touchend") {
                //  terminé
    
                return this._Stop();
            }
    
            //  traitement du mousemove
            if (this._ProcessMouseMoveEvent(evt) === false) {
                return this._Stop();
            }
    
            return this;
        },
        _Dispose: function () {
            this._Items = null;
            this._Backup = null;
            this._SourceScheduler = null;
            this._CurrentScheduler = null;
        }
    });
    
    Bridge.define('GridControls._SchedulerMouseOptions', {
        /**
         * Délai d'affichage des tooltips, en millisecondes
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerMouseOptions
         * @default 500
         * @type number
         */
        tooltipDelay: 500,
        /**
         * Délai entre deux clics
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerMouseOptions
         * @default 250
         * @type number
         */
        doubleClickDelay: 250,
        /**
         * Ecart maximum autorisé entre deux clics, en pixels, pour que ça soit considéré comme un double clic
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerMouseOptions
         * @default 10
         * @type number
         */
        doubleClicDistance: 10,
        nonClickableCssClasses: null
    });
    
    Bridge.define('GridControls._SchedulerOptionsCallbacks', {
        /**
         * GetItemHtmlTemplate(Scheduler, string layerName, object) : fonction qui renvoie le contenu html d'un élément de RDV
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerOptionsCallbacks
         * @type GridControls.SchedulerGetItemTemplateDelegate
         */
        getItemHtmlTemplate: null,
        /**
         * OnError(SchedulerErrorEventArgs) : en cas d'erreur quelconque, le paramètre fournit des informations sur l'erreur
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerOptionsCallbacks
         * @type System.Action
         */
        onError: null,
        /**
         * OnAjaxRequest(Scheduler, bool) : le booléen en paramètre indique s'il y a des requêtes ajax en cours ou pas
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerOptionsCallbacks
         * @type GridControls.SchedulerOnAjaxRequestDelegate
         */
        onAjaxRequest: null,
        /**
         * OnDateChanged(cheduler, DateTime, DateTime) : appelé lorsque la date représentée a changé
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerOptionsCallbacks
         * @type GridControls.SchedulerOnDateChangedDelegate
         */
        onDateChanged: null,
        /**
         * OnTimeChanged(Scheduler, string) : appelé après que la ligne du temps ait été positionnée. l'heure passée sous forme de chaine est correctement formattée
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerOptionsCallbacks
         * @type GridControls.SchedulerOnTimeChangedDelegate
         */
        onTimeChanged: null,
        /**
         * OnClick(SchedulerMouseEventArg evt) : un clic a été fait. peut être suivi d'un double-clic
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerOptionsCallbacks
         * @type GridControls.SchedulerOnClickDelegate
         */
        onClick: null,
        /**
         * OnDoubleClick(SchedulerMouseEventArg evt) : un double-clic a été fait
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerOptionsCallbacks
         * @type GridControls.SchedulerOnClickDelegate
         */
        onDoubleClick: null,
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
        prepareMoveItems: null,
        /**
         * PrepareResizeItem(SchedulerResizeItemEventArgs arg) : infos sur le changement de durée de l'élément sélectionné
         Si les plages horaires autorisées (AllowedTimeRanges[]) sont à null il n'y a aucune contraine.
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerOptionsCallbacks
         * @type System.Action
         */
        prepareResizeItem: null,
        /**
         * OnItemChanged(Scheduler scheduler, object[] items) : fait suite au déplacement/resize d'éléments
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerOptionsCallbacks
         * @type System.Action
         */
        onItemsChanged: null,
        onMoveItemsStopped: null,
        onResizeItemsStopped: null
    });
    
    Bridge.define('GridControls._SchedulerOptionsLayout', {
        cellWidth: 15,
        cellWidthUnit: "%",
        minCellsWidth: 100,
        cellHeight: 100,
        cellHeightUnit: "px",
        minRowsHeight: 40,
        columnsHeaderHeight: 90,
        rowsHeaderWidth: 80,
        /**
         * Taille de la séparation entre deux jours
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerOptionsLayout
         * @default 3
         * @type number
         */
        daysSeparationSize: 3,
        /**
         * Place les heures en colonne plutôt qu'en live
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerOptionsLayout
         * @default false
         * @type boolean
         */
        inverseDirection: false
    });
    
    Bridge.define('GridControls._SchedulerOptionsTemplates', {
        /**
         * Contenu HTML à placer pour dessiner les traits vetrticaux des colonnes
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerOptionsTemplates
         * @type string
         */
        columnsHtmlContent: null,
        /**
         * Contenu HTML à placer pour dessiner les traits horizontaux des lignes
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerOptionsTemplates
         * @type string
         */
        rowsHtmlContent: null,
        /**
         * Callback (int) pour récupérer le template des en-têtes des heures
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerOptionsTemplates
         * @type System.Func
         */
        hoursTemplate: null,
        /**
         * string html = Callback (object) pour récupérer le template des en-têtes des calendriers
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerOptionsTemplates
         * @type System.Func
         */
        calendarsTemplate: null,
        /**
         * string html = Callback (object, dayIndex) pour récupérer le template des en-têtes des calendriers avec un offset de jour
         *
         * @instance
         * @public
         * @memberof GridControls._SchedulerOptionsTemplates
         * @type System.Func
         */
        calendarsTemplate2: null
    });
    
    Bridge.define('GridControls.Axis', {
        statics: {
            row: 0,
            column: 1
        },
        $enum: true
    });
    
    /**
     * Définition d'une tranche horaire pour un calendrier
     *
     * @public
     * @class GridControls.CalendarTimeRange
     */
    Bridge.define('GridControls.CalendarTimeRange', {
        /**
         * Identifiant du calendrier
         *
         * @instance
         * @public
         * @memberof GridControls.CalendarTimeRange
         * @type string
         */
        calendarID: null,
        /**
         * Heure de début
         *
         * @instance
         * @public
         * @memberof GridControls.CalendarTimeRange
         * @type number
         */
        fromHour: 0,
        /**
         * Minute de début
         *
         * @instance
         * @public
         * @memberof GridControls.CalendarTimeRange
         * @type number
         */
        fromMinute: 0,
        /**
         * Heure de fin
         *
         * @instance
         * @public
         * @memberof GridControls.CalendarTimeRange
         * @type number
         */
        toHour: 0,
        /**
         * Minute de fin
         *
         * @instance
         * @public
         * @memberof GridControls.CalendarTimeRange
         * @type number
         */
        toMinute: 0,
        config: {
            init: function () {
                this.date = new Date(-864e13);
            }
        }
    });
    
    Bridge.define('GridControls.CompositeGrid', {
        host: null,
        m_Bindings: null,
        scrollableAreaID: null,
        config: {
            init: function () {
                this.m_Bindings = new Bridge.List$1(GridControls._CompositeGridScrollBinding)();
            }
        },
        constructor: function (host) {
            this.host = host;
    
            this.scrollableAreaID = Bridge.as($(host).data("scrollable-area-id"), String);
            /* 
                jQuery.Select(ScrollableAreaID).Resize(() =>
                {
                    Console.Log("resize");
                });*/
    
            $(host).find(".composite-grid-item").each(Bridge.fn.bind(this, $_.GridControls.CompositeGrid.f1));
        },
        onGridScrolled: function (grid, x, y) {
            var $t;
            $t = Bridge.getEnumerator(this.m_Bindings);
            while ($t.moveNext()) {
                var b = $t.getCurrent();
                if (b.horizontal) {
                    GridControls.Grid.query$1(String.fromCharCode(35) + b.destinationID).setHScrollPosition(x);
                }
                else  {
                    GridControls.Grid.query$1(String.fromCharCode(35) + b.destinationID).setVScrollPosition(y);
                }
            }
        },
        syncHorizontalScrolling: function (id) {
            this.m_Bindings.add(Bridge.merge(new GridControls._CompositeGridScrollBinding(), {
                horizontal: true,
                destinationID: id
            } ));
        },
        syncVerticalScrolling: function (id) {
            this.m_Bindings.add(Bridge.merge(new GridControls._CompositeGridScrollBinding(), {
                horizontal: false,
                destinationID: id
            } ));
        },
        destroy: function () {
            if (!Bridge.hasValue(this.host)) {
                return;
            }
    
            $(this.host).find(".composite-grid-item").each($_.GridControls.CompositeGrid.f2);
    
            this.host = null;
            this.m_Bindings = null;
        }
    });
    
    Bridge.ns("GridControls.CompositeGrid", $_)
    
    Bridge.apply($_.GridControls.CompositeGrid, {
        f1: function (i, e) {
            var elementID = $(e).prop("id");
    
            var scrollDisabled = false;
            if (Bridge.String.equals(this.scrollableAreaID, elementID) === false) {
                scrollDisabled = true;
            }
            var grid = new GridControls.Grid(Bridge.merge(new GridControls.GridOptions(), {
                scrollDisabled: scrollDisabled
            } ));
    
            if (scrollDisabled === false) {
                grid.scrollChangedCallback = Bridge.fn.bind(this, this.onGridScrolled);
            }
            else  {
                if (Bridge.String.isNullOrEmpty(elementID) === false) {
                    var sync = Bridge.as($(e).data("sync-scroll"), String);
                    if (Bridge.String.equals(("horizontal"), sync, 3) || Bridge.String.equals(("both"), sync, 3)) {
                        this.syncHorizontalScrolling(elementID);
                    }
    
                    if (Bridge.String.equals(("vertical"), sync, 3) || Bridge.String.equals(("both"), sync, 3)) {
                        this.syncVerticalScrolling(elementID);
                    }
                }
            }
    
            grid.attach(e);
        },
        f2: function (i, e) {
            var grid = GridControls.Grid.query(e);
            if (Bridge.hasValue(grid)) {
                grid.destroy();
            }
        }
    });
    
    Bridge.define('GridControls.GridCustomizeItem', {
        itemData: null,
        position: null,
        cssClasses: null,
        htmlContent: null,
        /**
         * ID interne de l'élément ajouté
         *
         * @instance
         * @public
         * @memberof GridControls.GridCustomizeItem
         * @type number
         */
        _LayerItemID: 0,
        _Element: null
    });
    
    Bridge.define('GridControls.GridOptions', {
        statics: {
            bindCustomScrollbars: null,
            updateCustomScrollbars: null,
            unbindCustomScrollbars: null
        },
        onScrollChanged: null,
        onLayout: null,
        scrollDisabled: false,
        _AutoLayout: true
    });
    
    Bridge.define('GridControls.HtmlElementHelper', {
        statics: {
            setTransform: function (element, transform) {
                element.style["-webkit-transform"] = transform;
                element.style["-ms-transform"] = transform;
                element.style.transform = transform;
            }
        }
    });
    
    Bridge.define('GridControls.LoadItemsUrlBuilderEventArgs', {
        tag: null,
        items: null,
        config: {
            init: function () {
                this.loadFrom = new Date(-864e13);
                this.loadTo = new Date(-864e13);
            }
        }
    });
    
    Bridge.define('GridControls.SchedulerDataSource', {
        statics: {
            create: function (options) {
                return new GridControls.SchedulerDataSource(options);
            }
        },
        _Options: null,
        _RegisteredReceivers: null,
        _RunningAjaxRequests: 0,
        _LoadedDates: null,
        _Calendars: null,
        _Items: null,
        _AvailaibleResourcesPerDay: null,
        _ItemRemoved: null,
        _SuspendCount: 0,
        _UnboundItems: null,
        config: {
            init: function () {
                this._Options = new GridControls.SchedulerDataSourceOptions();
                this._RegisteredReceivers = new Bridge.Collections.HashSet$1(GridControls._ISchedulerDataReceiver)("constructor");
                this._LoadedDates = new Bridge.Collections.HashSet$1(Date)("constructor");
                this._Calendars = new Bridge.Dictionary$2(String,GridControls._CalendarDataObject)();
                this._Items = new Bridge.Dictionary$2(String,GridControls._SchedulerItem)();
                this._AvailaibleResourcesPerDay = new Bridge.Dictionary$2(Date,Array)();
                this._ItemRemoved = new Bridge.Collections.HashSet$1(Object)("constructor");
                this._UnboundItems = new Bridge.Dictionary$2(String,Object)();
            }
        },
        constructor: function (options) {
            this._Options = options;
    
            if (Bridge.String.isNullOrEmpty(options.calendarsUrl) === false) {
                this.downloadCalendars(options.calendarsUrl);
            }
    
            if (Bridge.hasValue(this._Options.loadItemsUrlBuilder)) {
                //DownloadItems(DateTime.Now.Date, DateTime.Now.Date);
            }
        },
        getCalendars: function () {
            return Bridge.Linq.Enumerable.from(this._Calendars.getValues()).orderBy($_.GridControls.SchedulerDataSource.f1).toArray();
        },
        getActiveDates: function () {
            var $t;
            var dates = new Bridge.List$1(Date)();
    
            $t = Bridge.getEnumerator(this._RegisteredReceivers);
            while ($t.moveNext()) {
                var recv = $t.getCurrent();
                var d = recv.get_DateFilter();
                for (var i = 0; i < recv.getNumberOfVisibleDays(); i = (i + 1) | 0) {
                    dates.add(new Date(new Date(d.getFullYear(), d.getMonth(), d.getDate()).valueOf() + Math.round((i) * 864e5)));
                }
            }
    
            return dates.toArray();
        },
        suspendAllLayouts: function () {
            var $t;
            this._SuspendCount = (this._SuspendCount + 1) | 0;
            if (this._SuspendCount === 1) {
                $t = Bridge.getEnumerator(this._RegisteredReceivers);
                while ($t.moveNext()) {
                    var sdr = $t.getCurrent();
                    sdr.suspendLayout();
                }
            }
        },
        resumeAllLayouts: function () {
            var $t, $t1;
            this._SuspendCount = (this._SuspendCount - 1) | 0;
            if (this._SuspendCount === 0) {
                $t = Bridge.getEnumerator(this._RegisteredReceivers);
                while ($t.moveNext()) {
                    var sdr = $t.getCurrent();
                    sdr.resumeLayout();
                }
    
                $t1 = Bridge.getEnumerator(this._ItemRemoved);
                while ($t1.moveNext()) {
                    var o = $t1.getCurrent();
                    this.removeItem(o);
                }
                this._ItemRemoved.clear();
            }
        },
        _UpdateItemObject: function (item) {
            var o = item.itemObject;
    
            o[this._Options.itemCalendarField] = item.calendarID;
            o[this._Options.itemDateField] = item.itemDate;
            o[this._Options.itemDurationField] = item.duration.toString();
        },
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
        getGroupItems: function (item) {
            var id = this.getItemID(item);
            if (!Bridge.hasValue(id) || this._Items.containsKey(id) === false) {
                return null;
            }
    
            var sitem = this._Items.get(id);
            var group = sitem.groupID;
            //DateTime date = sitem.ItemDate.Date;
            if (Bridge.String.isNullOrEmpty(group)) {
                return [sitem.itemObject];
            }
    
            //  date == i.ItemDate.Date && 
            return Bridge.Linq.Enumerable.from(this._Items.getValues()).where(function (i) {
                return group === i.groupID;
            }).select($_.GridControls.SchedulerDataSource.f2).toArray();
        },
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
        getGroupItemsFromGroupID: function (group) {
            if (Bridge.String.isNullOrEmpty(group)) {
                return Bridge.Array.init(0, null);
            }
    
            return Bridge.Linq.Enumerable.from(this._Items.getValues()).where(function (i) {
                return i.groupID === group;
            }).select($_.GridControls.SchedulerDataSource.f2).toArray();
        },
        refresh: function (iDsToReload, iDsToRemove, onReloadComplete) {
            var $t;
            if (onReloadComplete === void 0) { onReloadComplete = null; }
            this.suspendAllLayouts();
            if (Bridge.hasValue(iDsToRemove) && iDsToRemove.length > 0) {
                $t = Bridge.getEnumerator(iDsToRemove);
                while ($t.moveNext()) {
                    var itemID = $t.getCurrent();
                    if (this._Items.containsKey(itemID) === false) {
                        continue;
                    }
    
                    this.removeItem(this._Items.get(itemID).itemObject);
                }
            }
            if (Bridge.hasValue(iDsToReload) && iDsToReload.length > 0) {
                this._DownloadItems$1(iDsToReload, onReloadComplete);
            }
            this.resumeAllLayouts();
        },
        _DownloadItems$1: function (itemsIDs, onReloadComplete) {
            if (onReloadComplete === void 0) { onReloadComplete = null; }
            this._IncrementAjaxRequestCount(1);
    
            var args = Bridge.merge(new GridControls.LoadItemsUrlBuilderEventArgs(), {
                loadFrom: new Date(),
                loadTo: new Date(),
                tag: null,
                items: itemsIDs
            } );
            var url = this._Options.loadItemsUrlBuilder(args);
            this.getJSON(url, null, Bridge.fn.bind(this, function (data, status, xhr) {
                var $t;
                var dyndata = data;
                var items;
                if (Bridge.is(dyndata, Array)) {
                    items = Bridge.cast(data, Array);
                }
                else  {
                    //  alors que la V2 demande à recevoir un objet avec un tableur pour les RDV et un tableur pour les employés visibles
                    items = dyndata.Items;
                }
                //  Suppression des éléments qui ont été demandés mais pas renvoyés
                if (Bridge.hasValue(items)) {
                    var idsToRemove = new Bridge.Collections.HashSet$1(String)("constructor$1", Bridge.Linq.Enumerable.from(itemsIDs).select($_.GridControls.SchedulerDataSource.f3));
                    $t = Bridge.getEnumerator(items);
                    while ($t.moveNext()) {
                        var o = $t.getCurrent();
                        var id = this.getItemID(o);
                        if (Bridge.String.isNullOrEmpty(id) === false) {
                            id = Bridge.String.replaceAll(id, "-", "");
                            if (idsToRemove.contains(id)) {
                                idsToRemove.remove(id);
                            }
                        }
                    }
    
                    if (idsToRemove.getCount() > 0) {
                        this.refresh(null, Bridge.Linq.Enumerable.from(idsToRemove).toArray());
                    }
                }
    
                //
                this._OnItemsDownloaded(data, status, xhr);
                if (Bridge.hasValue(onReloadComplete)) {
                    onReloadComplete();
                }
            }));
        },
        _DownloadItems: function (url, queryData, onSuccess, onError, onDownloaded, cacheDate) {
            if (queryData === void 0) { queryData = null; }
            if (onSuccess === void 0) { onSuccess = null; }
            if (onError === void 0) { onError = null; }
            if (onDownloaded === void 0) { onDownloaded = null; }
            if (cacheDate === void 0) { cacheDate = null; }
            this._IncrementAjaxRequestCount(1, cacheDate);
            this.getJSON(url, queryData, Bridge.fn.bind(this, function (data, status, xhr) {
                this._OnItemsDownloaded(data, status, xhr, onSuccess, onError, onDownloaded, cacheDate);
            }));
        },
        downloadItems: function (dateFrom, dateTo, uriBuilderTag, queryData, forceDownload, onSuccess, onError) {
            var $t;
            if (uriBuilderTag === void 0) { uriBuilderTag = null; }
            if (queryData === void 0) { queryData = null; }
            if (forceDownload === void 0) { forceDownload = false; }
            if (onSuccess === void 0) { onSuccess = null; }
            if (onError === void 0) { onError = null; }
            if (this._AvailaibleResourcesPerDay.containsKey(new Date(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate())) === false) {
                forceDownload = true;
            }
    
            var datesToLoad = new Bridge.List$1(Date)();
            var current = new Date(dateFrom.getFullYear(), (dateFrom.getMonth() + 1) - 1, dateFrom.getDate());
            while (Bridge.Date.lte(current, new Date(dateTo.getFullYear(), dateTo.getMonth(), dateTo.getDate()))) {
                //   on ne télécharge que les journées inconnues
                if (forceDownload || this._LoadedDates.contains(current) === false) {
                    datesToLoad.add(current);
                }
    
                this._LoadedDates.add$1(current);
                current = new Date(current.valueOf() + Math.round((1) * 864e5));
            }
    
            if (datesToLoad.getCount() === 0) {
                if (Bridge.hasValue(onSuccess)) {
                    onSuccess(this);
                }
                return;
            }
    
            var args;
            var callDownload = Bridge.fn.bind(this, function (e) {
                this._DownloadItems(this._Options.loadItemsUrlBuilder(e), queryData, onSuccess, onError, function (s, error) {
                    var tempdate = new Date(e.loadFrom.getFullYear(), (e.loadFrom.getMonth() + 1) - 1, e.loadFrom.getDate());
                    while (Bridge.Date.lte(tempdate, new Date(e.loadTo.getFullYear(), e.loadTo.getMonth(), e.loadTo.getDate()))) {
                        tempdate = new Date(tempdate.valueOf() + Math.round((1) * 864e5));
                    }
                }, new Date(e.loadFrom.getFullYear(), e.loadFrom.getMonth(), e.loadFrom.getDate()));
            });
    
            //  On essaie de faire des périodes
            var tempDates = Bridge.Linq.Enumerable.from(datesToLoad).orderBy($_.GridControls.SchedulerDataSource.f4).toList(Date);
            current = tempDates.getItem(0);
            for (var i = 1; i < tempDates.getCount(); i = (i + 1) | 0) {
                var next = new Date(current.valueOf() + Math.round((1) * 864e5));
    
                //  Si on a pas un jour consécutif ou que la dernière mise à jour n'est pas la même
                //if (tempDates[i] != next)
                {
                    //  On a une période
                    args = Bridge.merge(new GridControls.LoadItemsUrlBuilderEventArgs(), {
                        loadFrom: current,
                        loadTo: tempDates.getItem(((i - 1) | 0)),
                        tag: uriBuilderTag
                    } );
                    callDownload(args);
    
                    current = tempDates.getItem(i);
                }
            }
    
            //  Et on termine la dernière période
            args = Bridge.merge(new GridControls.LoadItemsUrlBuilderEventArgs(), {
                loadFrom: current,
                loadTo: tempDates.getItem(((tempDates.getCount() - 1) | 0)),
                tag: uriBuilderTag
            } );
            callDownload(args);
    
            $t = Bridge.getEnumerator(this._RegisteredReceivers);
            while ($t.moveNext()) {
                var s = $t.getCurrent();
                // ---- on affiche / masque les ressources
                if (Bridge.equals(new Date(s.get_DateFilter().getFullYear(), s.get_DateFilter().getMonth(), s.get_DateFilter().getDate()), new Date(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate()))) {
                    if (this._AvailaibleResourcesPerDay.containsKey(new Date(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate()))) {
                        s._UpdateVisibleCalendars(this._AvailaibleResourcesPerDay.get(new Date(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate())));
                    }
                    else  {
                        s._UpdateVisibleCalendars(Bridge.Array.init(0, null));
                    }
                }
            }
        },
        getJSON: function (url, querydata, onCompletedCallBack) {
            var $t, $t1;
            /* 
                var obj = { };
                var pairs = queryString.split('&');
                for (i in pairs)
                {
                    var split = pairs[i].split('=');
                    obj[decodeURIComponent(split[0])] = decodeURIComponent(split[1]);
                }*/
    
            if (Bridge.String.contains(url,"?post=")) {
                var idx = Bridge.String.indexOf(url, String.fromCharCode(63));
    
                var d = { };
                $t = Bridge.getEnumerator(url.substr(((idx + 1) | 0)).split(String.fromCharCode(38)));
                while ($t.moveNext()) {
                    var pair = $t.getCurrent();
                    var parts = pair.split(String.fromCharCode(61));
                    if (parts[0] === "post" && parts.length > 0) {
                        $.extend(d,JSON.parse(decodeURIComponent(parts[1])));
                    }
                    else  {
                        d[decodeURIComponent(parts[0])] = parts.length > 1 ? decodeURIComponent(parts[1]) : "";
                    }
                }
    
                if (Bridge.hasValue(querydata)) {
                    $.extend(d,querydata);
                }
                querydata = d;
                url = url.substr(0, idx);
            }
    
            var options = {  };
            options.url = url;
            options.data = JSON.stringify(($t1 = querydata, Bridge.hasValue($t1) ? $t1 : { }));
            options.contentType = "application/json; charset=utf-8";
            options.dataType = "json";
            options.type = "POST";
            options.success = onCompletedCallBack;
            options.error = function (jqhr, msg, exception) {
                onCompletedCallBack(null, null, jqhr);
            };
    
            var result = $.ajax(options);
            return result;
        },
        _OnItemsDownloaded: function (data, status, xhr, onSuccess, onError, onDownloaded, cacheDate) {
            var $t;
            if (onSuccess === void 0) { onSuccess = null; }
            if (onError === void 0) { onError = null; }
            if (onDownloaded === void 0) { onDownloaded = null; }
            if (cacheDate === void 0) { cacheDate = null; }
            var error = xhr.status < 200 || xhr.status >= 300 || !Bridge.hasValue(data);
    
            this._IncrementAjaxRequestCount(-1, cacheDate);
    
            if (Bridge.hasValue(onDownloaded)) {
                onDownloaded(this, error);
            }
    
            if (error) {
                this._RaiseError(GridControls.SchedulerErrors.loadItems, "Bad HTTP status code " + xhr.status.toString(), xhr.statusText);
                if (Bridge.hasValue(onError)) {
                    onError(this);
                }
                return;
            }
    
            //  on garde la compatibilité avec la V1 qui ne recvait qu'un tableau
            var dyndata = data;
            var items;
            var activeCalendarsIDs;
            if (Bridge.is(dyndata, Array)) {
                items = Bridge.cast(data, Array);
                activeCalendarsIDs = Bridge.Linq.Enumerable.from(this._Calendars.getKeys()).toArray();
            }
            else  {
                //  alors que la V2 demande à recevoir un objet avec un tableur pour les RDV et un tableur pour les employés visibles
                items = dyndata.Items;
    
                if (!Bridge.hasValue(dyndata.ActiveCalendarsIDs)) {
                    activeCalendarsIDs = Bridge.Linq.Enumerable.from(this._Calendars.getKeys()).toArray();
                }
                else  {
                    activeCalendarsIDs = dyndata.ActiveCalendarsIDs;
                }
            }
    
            if (Bridge.hasValue(this._Options.onItemsDownloaded)) {
                var temp = (new Bridge.List$1(Object)(items)).toArray();
                var result = this._Options.onItemsDownloaded(temp);
    
                if (Bridge.hasValue(result)) {
                    items = result;
                }
            }
    
            this.addOrUpdateItems(items);
    
            // ---------
            if (Bridge.Nullable.hasValue(cacheDate)) {
                this._AvailaibleResourcesPerDay.set(Bridge.Nullable.getValue(cacheDate), activeCalendarsIDs);
            }
    
            $t = Bridge.getEnumerator(this._RegisteredReceivers);
            while ($t.moveNext()) {
                var s = $t.getCurrent();
                // ---- on affiche / masque les ressources
                s._UpdateVisibleCalendars(activeCalendarsIDs);
            }
    
            if (Bridge.hasValue(onSuccess)) {
                onSuccess(this);
            }
        },
        _BindItem: function (item, o, defaultLayer) {
            if (defaultLayer === void 0) { defaultLayer = "items"; }
            var itemID = o[this._Options.itemIDField].toString();
            item._LastUpdate = new Date();
    
            item.calendarID = o[this._Options.itemCalendarField].toString();
    
            item.itemID = itemID;
            item.itemObject = o;
    
            if (Bridge.String.isNullOrEmpty(this._Options.itemCssClassField)) {
                item.cssClasses = ["scheduler-item"];
            }
            else  {
                var css = o[this._Options.itemCssClassField];
                if (Bridge.String.isNullOrEmpty(css) === false) {
                    item.cssClasses = (css + " scheduler-item").trim().split(String.fromCharCode(32));
                }
                else  {
                    item.cssClasses = ["scheduler-item"];
                }
            }
    
            if (Bridge.String.isNullOrEmpty(this._Options.itemGroupField) === false) {
                var temp = o[this._Options.itemGroupField];
                item.groupID = (Bridge.hasValue(temp)) ? temp.toString() : null;
            }
    
            item.itemDate = o[this._Options.itemDateField];
            item.duration = Bridge.Int.parseInt(o[this._Options.itemDurationField].toString(), -2147483648, 2147483647);
    
            if (Bridge.String.isNullOrEmpty(this._Options.itemLayerField)) {
                item.itemLayerName = defaultLayer;
            }
            else  {
                item.itemLayerName = o[this._Options.itemLayerField].toString();
            }
        },
        _NotifyItemsChanged: function (added, updated, removed, receiver) {
            var $t;
            if (receiver === void 0) { receiver = null; }
            if (!Bridge.hasValue(added)) {
                added = Bridge.Array.init(0, null);
            }
            if (!Bridge.hasValue(updated)) {
                updated = Bridge.Array.init(0, null);
            }
            if (!Bridge.hasValue(removed)) {
                removed = Bridge.Array.init(0, null);
            }
    
            var receivers = (Bridge.hasValue(receiver)) ? (Bridge.cast([receiver], Bridge.IEnumerable$1(GridControls._ISchedulerDataReceiver))) : (Bridge.cast(this._RegisteredReceivers, Bridge.IEnumerable$1(GridControls._ISchedulerDataReceiver)));
    
            $t = Bridge.getEnumerator(receivers);
            while ($t.moveNext()) {
                var sdr = $t.getCurrent();
                /* 
                    _SchedulerItem[] addedtemp = added.Where(i => i.ItemDate.Date == sdr._DateFilter).OrderBy(i => i._InternalID).ToArray();
                    _SchedulerItem[] updatedtemp = updated.Where(i => i.ItemDate.Date == sdr._DateFilter).OrderBy(i => i._InternalID).ToArray();
                    _SchedulerItem[] removedtemp = removed.Where(i => i.ItemDate.Date == sdr._DateFilter).OrderBy(i => i._InternalID).ToArray();
    
                    if (addedtemp.Length == 0 && updatedtemp.Length == 0 && removedtemp.Length == 0)
                        continue;
    
                    sdr._OnItemsChanged(addedtemp, updatedtemp, removedtemp);*/
                sdr._OnItemsChanged(Bridge.Linq.Enumerable.from(added).toArray(), Bridge.Linq.Enumerable.from(updated).toArray(), Bridge.Linq.Enumerable.from(removed).toArray());
            }
        },
        addOrUpdateItems: function (items, defaultLayer) {
            var $t;
            if (defaultLayer === void 0) { defaultLayer = "items"; }
            if (!Bridge.hasValue(items)) {
                return;
            }
    
            var updatedItems = new Bridge.List$1(GridControls._SchedulerItem)();
            var addedItems = new Bridge.List$1(GridControls._SchedulerItem)();
    
            $t = Bridge.getEnumerator(items);
            while ($t.moveNext()) {
                var o = $t.getCurrent();
                var itemID = o[this._Options.itemIDField].toString();
                var calID = o[this._Options.itemCalendarField].toString();
    
                if (this._Calendars.containsKey(calID) === false) {
                    this._UnboundItems.set(itemID, o);
                    continue;
                }
    
                var co = this._Calendars.get(calID);
                var item = null;
                var rangeIndex;
                var isnew;
                if (co.pinned === GridControls._PinSide.left) {
                    rangeIndex = 1;
                }
                else  {
                    if (co.pinned === GridControls._PinSide.right) {
                        rangeIndex = 3;
                    }
                    else  {
                        rangeIndex = 2;
                    }
                }
    
                if (this._Items.containsKey(itemID)) {
                    item = this._Items.get(itemID);
                    updatedItems.add(item);
                    isnew = false;
                }
                else  {
                    item = new GridControls._SchedulerItem();
                    addedItems.add(item);
                    isnew = true;
                }
    
                this._BindItem(item, o, defaultLayer);
                if (isnew === false && rangeIndex !== item._RangeIndex) {
                    item._OldRangeIndex = item._RangeIndex;
                }
                else  {
                    item._OldRangeIndex = null;
                }
                item._RangeIndex = rangeIndex;
    
                this._Items.set(item.itemID, item);
            }
    
            this._NotifyItemsChanged(addedItems, updatedItems, null);
        },
        _IncrementAjaxRequestCount: function (step, date) {
            var $t;
            if (date === void 0) { date = null; }
            this._RunningAjaxRequests = (this._RunningAjaxRequests + step) | 0;
    
            $t = Bridge.getEnumerator(this._RegisteredReceivers);
            while ($t.moveNext()) {
                var idr = $t.getCurrent();
                //if (date.HasValue == false || date.Value.Date == idr._DateFilter.Date)
                idr._IncrementAjaxRequestCount(step);
            }
        },
        _Register: function (receiver) {
            if (!Bridge.hasValue(receiver)) {
                return;
            }
    
            if (this._RunningAjaxRequests > 0) {
                receiver._IncrementAjaxRequestCount(this._RunningAjaxRequests);
            }
    
            if (this._Calendars.getCount() > 0) {
                receiver._OnCalendarsAdded(Bridge.Linq.Enumerable.from(this._Calendars.getValues()).orderBy($_.GridControls.SchedulerDataSource.f1).toArray());
            }
    
            this._NotifyItemsChanged(Bridge.Linq.Enumerable.from(this._Items.getValues()).where(function (i) {
                return Bridge.Date.gte(new Date(i.itemDate.getFullYear(), i.itemDate.getMonth(), i.itemDate.getDate()), new Date(receiver.get_DateFilter().getFullYear(), receiver.get_DateFilter().getMonth(), receiver.get_DateFilter().getDate())) && Bridge.Date.lt(new Date(i.itemDate.getFullYear(), i.itemDate.getMonth(), i.itemDate.getDate()), new Date(new Date(receiver.get_DateFilter().getFullYear(), receiver.get_DateFilter().getMonth(), receiver.get_DateFilter().getDate()).valueOf() + Math.round((receiver.getNumberOfVisibleDays()) * 864e5)));
            }), null, null, receiver);
            this._RegisteredReceivers.add$1(receiver);
        },
        _ResizeItem: function (evt) {
            evt.stopPropagation();
            evt.preventDefault();
            return false;
        },
        _Unregister: function (receiver) {
            if (!Bridge.hasValue(receiver)) {
                return;
            }
    
            this._RegisteredReceivers.remove(receiver);
        },
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
        addCalendars: function (objects) {
            this._AddCalendarsObjects(objects);
        },
        _RaiseError: function (error, message, data) {
        },
        _AddCalendarsObjects: function (calendars) {
            var $t, $t1;
            var newCalendars = new Bridge.List$1(GridControls._CalendarDataObject)();
            var index = this._Calendars.getCount() === 0 ? 1 : ((Bridge.Linq.Enumerable.from(this._Calendars.getValues()).select($_.GridControls.SchedulerDataSource.f1).max() + 1) | 0);
            $t = Bridge.getEnumerator(calendars);
            while ($t.moveNext()) {
                var o = $t.getCurrent();
                var co = new GridControls._CalendarDataObject();
                co.receivedOrder = index;
                index = (index + 1) | 0;
                co.calendarObject = o;
    
                if (Bridge.String.isNullOrEmpty(this._Options.calendarPinnedField) === false) {
                    var dir = o[this._Options.calendarPinnedField];
                    if (Bridge.String.equals(("left"), dir)) {
                        co.pinned = GridControls._PinSide.left;
                    }
                    else  {
                        if (Bridge.String.equals(("right"), dir)) {
                            co.pinned = GridControls._PinSide.right;
                        }
                        else  {
                            co.pinned = GridControls._PinSide.none;
                        }
                    }
                }
    
                co.iD = o[this._Options.calendarIDField].toString();
                newCalendars.add(co);
                this._Calendars.add(co.iD, co);
            }
    
            var newCalendarsArray = newCalendars.toArray();
            $t1 = Bridge.getEnumerator(this._RegisteredReceivers);
            while ($t1.moveNext()) {
                var ds = $t1.getCurrent();
                ds._OnCalendarsAdded(newCalendarsArray);
            }
    
            if (this._UnboundItems.getCount() > 0) {
                var temp = Bridge.Linq.Enumerable.from(this._UnboundItems.getValues()).toArray();
                this._UnboundItems.clear();
                this.addOrUpdateItems(temp);
            }
        },
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
        downloadCalendars: function (url, queryData, onSuccess, onError) {
            if (queryData === void 0) { queryData = null; }
            if (onSuccess === void 0) { onSuccess = null; }
            if (onError === void 0) { onError = null; }
            this._IncrementAjaxRequestCount(1);
    
            this.getJSON(url, queryData, Bridge.fn.bind(this, function (data, status, xhr) {
                if (!Bridge.hasValue(this._RegisteredReceivers)) {
                    return;
                }
    
                this._IncrementAjaxRequestCount(-1);
    
                if (xhr.status < 200 || xhr.status >= 300) {
                    this._RaiseError(GridControls.SchedulerErrors.loadCalendars, "Bad HTTP status code " + xhr.status.toString(), xhr.statusText);
                    if (Bridge.hasValue(onError)) {
                        onError(this);
                    }
                    return;
                }
    
                //  
                var items = Bridge.cast(data, Array);
                if (Bridge.hasValue(this._Options.onCalendarsDownloaded)) {
                    var temp = this._Options.onCalendarsDownloaded(items);
                    if (Bridge.hasValue(temp)) {
                        items = temp;
                    }
                }
    
                this._AddCalendarsObjects(items);
    
                //  
                if (Bridge.hasValue(onSuccess)) {
                    onSuccess(this);
                }
            }));
        },
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
        addOrUpdateItem: function (item) {
            if (!Bridge.hasValue(item)) {
                return;
            }
    
            this.addOrUpdateItems([item]);
        },
        removeItem: function (item) {
            if (!Bridge.hasValue(item)) {
                return;
            }
    
            if (this._SuspendCount !== 0) {
                item[this._Options.itemDateField] = new Date(-864e13);
                this.addOrUpdateItems([item]);
                this._ItemRemoved.add$1(item);
                return;
            }
    
            var itemID = item[this._Options.itemIDField].toString();
            if (this._Items.containsKey(itemID) === false) {
                return;
            }
    
            if (item[this._Options.itemDateField] !== new Date(-864e13)) {
                var sItem = this._Items.get(itemID);
                this._NotifyItemsChanged(null, null, [sItem]);
            }
            this._Items.remove(itemID);
        },
        getItemID: function (item) {
            if (!Bridge.hasValue(item)) {
                return null;
            }
    
            var itemID = item[this._Options.itemIDField].toString();
            return itemID;
        },
        getItemFromID: function (id) {
            if (Bridge.String.isNullOrEmpty(id)) {
                return null;
            }
    
            if (this._Items.containsKey(id)) {
                return this._Items.get(id).itemObject;
            }
            return null;
        },
        getItemElementsFromSchedulers: function (item) {
            var $t;
            var elements = new Bridge.List$1(HTMLElement)();
            $t = Bridge.getEnumerator(this._RegisteredReceivers);
            while ($t.moveNext()) {
                var rcv = $t.getCurrent();
                if (Bridge.is(rcv, GridControls.Scheduler)) {
                    var sc = Bridge.cast(rcv, GridControls.Scheduler);
                    var e = sc.getItemContainer(item);
                    if (Bridge.hasValue(e)) {
                        elements.add(e);
                    }
                }
            }
            return elements.toArray();
        },
        dispose: function () {
            var $t;
            if (Bridge.hasValue(this._RegisteredReceivers)) {
                $t = Bridge.getEnumerator(Bridge.Linq.Enumerable.from(this._RegisteredReceivers).toArray());
                while ($t.moveNext()) {
                    var receiver = $t.getCurrent();
                    this._Unregister(receiver);
                }
                this._RegisteredReceivers.clear();
            }
            this._RegisteredReceivers = null;
            this._Options = null;
            this._Calendars = null;
        }
    });
    
    Bridge.ns("GridControls.SchedulerDataSource", $_)
    
    Bridge.apply($_.GridControls.SchedulerDataSource, {
        f1: function (c) {
            return c.receivedOrder;
        },
        f2: function (i) {
            return i.itemObject;
        },
        f3: function (x) {
            return Bridge.String.replaceAll(x, "-", "");
        },
        f4: function (d) {
            return d;
        }
    });
    
    Bridge.define('GridControls.SchedulerDataSourceOptions', {
        /**
         * URL où télécharger les en-têtes de calendrier (employés, ressources, ...)
         Si vide les calendriers ne seront pas chargés automatiquement
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerDataSourceOptions
         * @type string
         */
        calendarsUrl: null,
        /**
         * [REQUIS] string LoadItemsUrlBuilder(LoadItemsUrlBuilderEventArgs) : callback qui construit l'url utilisée pour télécharger les éléments de RDV au format JSON
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerDataSourceOptions
         * @type System.Func
         */
        loadItemsUrlBuilder: null,
        /**
         * [REQUIS] champ qui contient l'ID de l'élément
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerDataSourceOptions
         * @type string
         */
        itemIDField: null,
        /**
         * [REQUIS] champ qui contient la date et l'heure de l'élémnt, de type DateTime
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerDataSourceOptions
         * @type string
         */
        itemDateField: null,
        /**
         * [REQUIS] champ qui contient la durée
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerDataSourceOptions
         * @type string
         */
        itemDurationField: null,
        /**
         * [REQUIS] champ de l'élément qui contient la clé étrangère vers le calendrier associé
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerDataSourceOptions
         * @type string
         */
        itemCalendarField: null,
        /**
         * champ avec une liste de classes CSS à appliquer l'élémnt
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerDataSourceOptions
         * @type string
         */
        itemCssClassField: null,
        /**
         * champ avec un identifiant (quelconque) de calque sur lequel poserl'élément
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerDataSourceOptions
         * @type string
         */
        itemLayerField: null,
        /**
         * champ avec un identifiant (quelconque) de groupe (comme l'identifiant de rendez-vous du client et non du service)
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerDataSourceOptions
         * @type string
         */
        itemGroupField: null,
        /**
         * [REQUIS] champ qui contient l'ID du calendrier
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerDataSourceOptions
         * @type string
         */
        calendarIDField: null,
        /**
         * [facultatif] champ qui contient une chaine indiquant si la colonne est épinglée à gauche (left), à droite (right) ou pas du tout (vide)
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerDataSourceOptions
         * @type string
         */
        calendarPinnedField: null,
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
        onItemsDownloaded: null,
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
        onCalendarsDownloaded: null,
        /**
         * Nombre de jours affichés dans chacun des calendriers exploitant ce datasource
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerDataSourceOptions
         * @default 1
         * @type number
         */
        numberOfVisibleDays: 1
    });
    
    Bridge.define('GridControls.SchedulerErrorEventArgs', {
        errorType: 0,
        errorData: null,
        errorDescription: null
    });
    
    Bridge.define('GridControls.SchedulerErrors', {
        statics: {
            loadCalendars: 0,
            loadItems: 1
        },
        $enum: true
    });
    
    Bridge.define('GridControls.SchedulerMouseEventArgs', {
        /**
         * Contrôle Scheduler qui a émis l'événement
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerMouseEventArgs
         * @type GridControls.Scheduler
         */
        scheduler: null,
        /**
         * Liste des items de RDV présents sous le curseur au moment de l'événement
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerMouseEventArgs
         * @type Array.<Object>
         */
        items: null,
        /**
         * Identifiant du calendrier
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerMouseEventArgs
         * @type string
         */
        calendarID: null,
        /**
         * Heure entière (sans les minutes)
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerMouseEventArgs
         * @type number
         */
        hour: 0,
        /**
         * Minute
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerMouseEventArgs
         * @type number
         */
        minute: 0,
        /**
         * Event original fourni par jQuery
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerMouseEventArgs
         * @type jQuery.Event
         */
        originalEvent: null,
        /**
         * Liste de tous les éléments HTML placés sous le curseur au moment du clic
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerMouseEventArgs
         * @type Array.<HTMLElement>
         */
        elements: null
    });
    
    Bridge.define('GridControls.SchedulerMoveItemsEventArgs', {
        /**
         * Contrôle Scheduler qui a émis l'événement
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerMoveItemsEventArgs
         * @type GridControls.Scheduler
         */
        scheduler: null,
        /**
         * Element HTML qui a déclenché le déplacement
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerMoveItemsEventArgs
         * @type HTMLElement
         */
        moveElement: null,
        /**
         * Objet de rendez-vous pour lequel l'événement a été déclenché
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerMoveItemsEventArgs
         * @type Object
         */
        item: null,
        /**
         * Tableau retourné par l'utilisateur fournissant la liste du ou des éléments à déplacer
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerMoveItemsEventArgs
         * @type Array.<Object>
         */
        itemsToMove: null,
        /**
         * Liste des emplacement autorisés pour le déplacement. Tous les items de RDV doivent pouvoir être inscrits
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerMoveItemsEventArgs
         * @type Array.<GridControls.CalendarTimeRange>
         */
        allowedTimeRanges: null,
        /**
         * Permet le déplacement d'un calendrier à un autre
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerMoveItemsEventArgs
         * @default true
         * @type boolean
         */
        allowCalendarChange: true,
        /**
         * Permet le déplacement sur l'axe horaire
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerMoveItemsEventArgs
         * @default true
         * @type boolean
         */
        allowTimeChange: true,
        /**
         * Permet le déplacement d'un scheduler à un autre
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerMoveItemsEventArgs
         * @default true
         * @type boolean
         */
        allowDateChange: true,
        /**
         * Annule l'action
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerMoveItemsEventArgs
         * @default false
         * @type boolean
         */
        cancel: false,
        /**
         * Internvalle, en minutes
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerMoveItemsEventArgs
         * @default 5
         * @type number
         */
        step: 5
    });
    
    Bridge.define('GridControls.SchedulerOptions', {
        /**
         * 
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerOptions
         * @type GridControls._SchedulerMouseOptions
         */
        mouseEvents: null,
        /**
         * Callbacks disponibles pour l'implémentation du contrôle
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerOptions
         * @type GridControls._SchedulerOptionsCallbacks
         */
        callbacks: null,
        /**
         * Options de disposition
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerOptions
         * @type GridControls._SchedulerOptionsLayout
         */
        layout: null,
        /**
         * Définition des templates à utiliser
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerOptions
         * @type GridControls._SchedulerOptionsTemplates
         */
        template: null,
        /**
         * Première heure visible
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerOptions
         * @default 8
         * @type number
         */
        firstHour: 8,
        /**
         * Dernière heure visible
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerOptions
         * @default 19
         * @type number
         */
        lastHour: 19,
        numberOfVisibleDays: 1,
        config: {
            init: function () {
                this.layout = new GridControls._SchedulerOptionsLayout();
                this.viewDate = new Date(-864e13);
            }
        },
        constructor: function () {
            this.callbacks = new GridControls._SchedulerOptionsCallbacks();
            this.layout = new GridControls._SchedulerOptionsLayout();
            this.template = new GridControls._SchedulerOptionsTemplates();
            this.mouseEvents = new GridControls._SchedulerMouseOptions();
            this.viewDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
        }
    });
    
    Bridge.define('GridControls.SchedulerResizeItemEventArgs', {
        /**
         * Contrôle Scheduler qui a émis l'événement
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerResizeItemEventArgs
         * @type GridControls.Scheduler
         */
        scheduler: null,
        /**
         * Element HTML qui a déclenché le déplacement
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerResizeItemEventArgs
         * @type HTMLElement
         */
        resizeElement: null,
        /**
         * Item de RDV dont la durée va être modifiée
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerResizeItemEventArgs
         * @type Object
         */
        item: null,
        /**
         * Liste des emplacement autorisés pour le déplacement. Tous les items de RDV doivent pouvoir être inscrits
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerResizeItemEventArgs
         * @type Array.<GridControls.CalendarTimeRange>
         */
        allowedTimeRanges: null,
        /**
         * Annule l'action
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerResizeItemEventArgs
         * @default false
         * @type boolean
         */
        cancel: false,
        /**
         * Durée mini d'un rdv, en mintutes
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerResizeItemEventArgs
         * @default 15
         * @type number
         */
        minDuration: 15,
        /**
         * Intervalle, en minutes
         *
         * @instance
         * @public
         * @memberof GridControls.SchedulerResizeItemEventArgs
         * @default 5
         * @type number
         */
        step: 5
    });
    
    Bridge.define('GridControls._BaseControl', {
        inherits: [GridControls._GridElement],
        _HostElement: null,
        getIsAttached: function () {
            return Bridge.hasValue(this._HostElement);
        },
        attach: function (host) {
            if (!Bridge.hasValue(host) || !Bridge.hasValue(this.get_ControlElement())) {
                return;
            }
    
            //  On se sépare d'un éventuel ancien hôte
            this.detach();
    
            //  et on rattache le controle à son parent
            this._HostElement = host;
            host.appendChild(this.get_ControlElement());
        },
        detach: function () {
            if (!Bridge.hasValue(this._HostElement) || !Bridge.hasValue(this.get_ControlElement())) {
                return;
            }
            this._HostElement.removeChild(this.get_ControlElement());
        },
        destroy: function () {
            this.detach();
            this._HostElement = null;
        }
    });
    
    /**
     * classe utilisée pour les calculs du layout
     *
     * @public
     * @class GridControls._GridItemCell
     * @augments GridControls._GridElement
     */
    Bridge.define('GridControls._GridItemCell', {
        inherits: [GridControls._GridElement],
        statics: {
            makeKey: function (x, y) {
                return x.toString() + "." + y.toString();
            }
        },
        x: 0,
        y: 0,
        config: {
            properties: {
                Items: null
            }
        },
        getKey: function () {
            return GridControls._GridItemCell.makeKey(this.x, this.y);
        }
    });
    
    Bridge.define('GridControls._GridLayer', {
        inherits: [GridControls._GridElement],
        grid: null,
        layerElement: null,
        overlapingEnabled: true,
        itemsPaddingStart: 0,
        itemsPaddingEnd: 0,
        _Items: null,
        _Cells: null,
        _InvalidatedRanges: null,
        /**
         * Le chevauchement n'est permis que dans un sens au seins d'un même calque
         Les éléments placés pourront faire partie de plusieurs cellules uniquement dans cette direction
         *
         * @instance
         * @public
         * @memberof GridControls._GridLayer
         * @type GridControls.Axis
         */
        flowDirection: 1,
        m_OldRangesSizes: null,
        config: {
            init: function () {
                this._Items = new Bridge.Dictionary$2(Bridge.Int32,GridControls._LayerItem)();
                this._InvalidatedRanges = new Bridge.Collections.HashSet$1(Bridge.Int32)("constructor");
            }
        },
        constructor: function (grid) {
            GridControls._GridElement.prototype.$constructor.call(this);
    
            this.grid = grid;
    
            this.layerElement = document.createElement('div');
            this.layerElement.style.position = "absolute";
            this.layerElement.style.left = "0";
            this.layerElement.style.top = "0";
            this.layerElement.style.width = this.grid._LayersContainerElement.clientWidth.toString() + "px";
            this.layerElement.style.height = this.grid._LayersContainerElement.clientHeight.toString() + "px";
            this.layerElement.classList.add("grid-layer");
            grid._LayersContainerElement.appendChild(this.layerElement);
        },
        invalidateCells: function () {
            this._Cells = null;
        },
        removeAllItems: function () {
            this._Cells = null;
            this._Items.clear();
            $(this.layerElement).empty();
    
            this._InternalLayout();
        },
        /**
         * MÉTHODE À USAGE INTERNE UNIQUEMENT
         *
         * @instance
         * @public
         * @this GridControls._GridLayer
         * @memberof GridControls._GridLayer
         * @return  {void}
         */
        _InternalLayout: function () {
            var $t, $t1, $t2, $t3, $t4;
            if (!Bridge.hasValue(this.grid)) {
                return;
            }
    
            if (this.grid.getIsLayoutSuspended()) {
                this.grid._LayoutRequested = true;
                return;
            }
    
            this.layerElement.style.width = this.grid._LayersContainerElement.clientWidth.toString() + "px";
            this.layerElement.style.height = this.grid._LayersContainerElement.clientHeight.toString() + "px";
    
            //  Si la taille d'une rnagée a changé il faut redisposer les éléments
            var rangesSizes = Bridge.toArray(Bridge.Linq.Enumerable.from(this.grid._Columns).select($_.GridControls._GridLayer.f1)).join("/");
            rangesSizes += "+" + Bridge.toArray(Bridge.Linq.Enumerable.from(this.grid._Rows).select($_.GridControls._GridLayer.f1)).join("/");
    
            if (Bridge.String.equals(rangesSizes, this.m_OldRangesSizes) === false) {
                this._Cells = null;
                this._InvalidatedRanges.clear();
            }
    
            this.m_OldRangesSizes = rangesSizes;
    
            if (Bridge.hasValue(this._Cells) && this._InvalidatedRanges.getCount() === 0) {
                return;
            }
    
            this._Cells = new Bridge.Dictionary$2(String,GridControls._GridItemCell)();
            $t = Bridge.getEnumerator(this._Items.getValues());
            while ($t.moveNext()) {
                var i = $t.getCurrent();
                i.groupCount = 1;
                i.groupIndex = 0;
    
                this.calcItemCells(this._Cells, i);
            }
    
            //------------------------------------------
            //  calcul des cellules superposées
            //------------------------------------------
            var itemsToDisplay = new Bridge.List$1(GridControls._LayerItem)();
            if (this.overlapingEnabled === false) {
                //  on commence par les grouper par rangée
                var itemsPerRange = new Bridge.Dictionary$2(Bridge.Int32,Bridge.List$1(GridControls._LayerItem))();
                $t1 = Bridge.getEnumerator(this._Items.getValues());
                while ($t1.moveNext()) {
                    var i1 = $t1.getCurrent();
                    if (!Bridge.hasValue(i1.cells) || i1.cells.getCount() === 0) {
                        i1.element.style.display = "none";
                        continue;
                    }
    
                    if (itemsPerRange.containsKey(i1.axisIndex) === false) {
                        itemsPerRange.add(i1.axisIndex, new Bridge.List$1(GridControls._LayerItem)());
                    }
                    itemsPerRange.get(i1.axisIndex).add(i1);
                }
    
                var currentGroup = new Bridge.List$1(Bridge.List$1(GridControls._LayerItem))();
    
                var clsoeGroup = function () {
                    var $t2;
                    for (var idx = 0; idx < currentGroup.getCount(); idx = (idx + 1) | 0) {
                        $t2 = Bridge.getEnumerator(currentGroup.getItem(idx));
                        while ($t2.moveNext()) {
                            var groupItem = $t2.getCurrent();
                            groupItem.groupCount = currentGroup.getCount();
                            groupItem.groupIndex = idx;
                        }
                    }
                    currentGroup.clear();
                };
    
                var addToGroup = function (idx, item) {
                    if (idx >= currentGroup.getCount()) {
                        currentGroup.add(new Bridge.List$1(GridControls._LayerItem)());
                    }
                    currentGroup.getItem(idx).add(item);
                };
    
                $t2 = Bridge.getEnumerator(itemsPerRange.getKeys());
                while ($t2.moveNext()) {
                    var rangeIndex = $t2.getCurrent();
                    if (this._InvalidatedRanges.getCount() > 0 && this._InvalidatedRanges.contains(rangeIndex) === false) {
                        continue;
                    }
    
                    var rangeItems = Bridge.Linq.Enumerable.from(itemsPerRange.get(rangeIndex)).orderBy($_.GridControls._GridLayer.f2).toList(GridControls._LayerItem);
                    currentGroup.clear();
    
                    for (var i2 = 0; i2 < rangeItems.getCount(); i2 = (i2 + 1) | 0) {
                        var currentItem = rangeItems.getItem(i2);
                        itemsToDisplay.add(currentItem);
    
                        if (i2 === 0) {
                            addToGroup(0, currentItem);
                        }
                        else  {
                            //  est-qu'on peut placer ce slot sans interférer avec le groupe ?
                            var groupMemberIndex = -1;
                            var giIndex = 0;
                            var overlap = false;
                            var start = currentItem.getRangeStart();
                            $t3 = Bridge.getEnumerator(Bridge.Linq.Enumerable.from(currentGroup).select($_.GridControls._GridLayer.f3));
                            while ($t3.moveNext()) {
                                var gi = $t3.getCurrent();
                                //  On a une collision
                                var end = gi.getRangeEnd();
                                if (end > start) {
                                    overlap = true;
                                }
                                else  {
                                    if (groupMemberIndex === -1) {
                                        groupMemberIndex = giIndex;
                                    }
                                }
                                giIndex = (giIndex + 1) | 0;
                            }
    
                            //  S'il n'y a pas de chevauchement
                            if (overlap === false) {
                                clsoeGroup();
                                addToGroup(0, currentItem);
                            }
                            else  {
                                //  Si, dans le groupe, on peut peut placer cet élément sous un élément du groupe
                                if (groupMemberIndex !== -1) {
                                    //  Oui, ça devient le dernier de sa colonne
                                    addToGroup(groupMemberIndex, currentItem);
                                }
                                else  {
                                    //  Pas de place pour remplacer un slot exisant, alors on ajoute une colonne
                                    addToGroup(currentGroup.getCount(), currentItem);
                                }
                            }
                        }
                    }
    
                    //  Enfin on sauve les infos du groupe restant
                    clsoeGroup();
                }
            }
            else  {
                itemsToDisplay.addRange(this._Items.getValues());
            }
    
            $t4 = Bridge.getEnumerator(itemsToDisplay);
            while ($t4.moveNext()) {
                var i3 = $t4.getCurrent();
                if (!Bridge.hasValue(i3.cells) || i3.cells.getCount() === 0) {
                    i3.element.style.display = "none";
                    continue;
                }
    
                i3.element.style.display = "block";
                i3.computedWidthPct = 1.0 / i3.groupCount;
                i3.computedMarginPct = i3.computedWidthPct * i3.groupIndex;
    
                var start1 = i3.cells.getItem(0);
                var end1 = i3.cells.getItem(((i3.cells.getCount() - 1) | 0));
    
                var x1 = 0;
                var y1 = 0;
                var x2 = 0;
                var y2 = 0;
                var width;
                var height;
    
                var mainItemAxis = null;
                if (this.flowDirection === GridControls.Axis.column) {
                    y1 = this.grid._Rows.getItem(start1.y).computedOffset;
                    y1 = (y1 + Bridge.Int.clip32(Math.floor((this.grid._Rows.getItem(start1.y).computedSize * i3.itemStartOffset) / 100.0))) | 0;
    
                    y2 = this.grid._Rows.getItem(end1.y).computedOffset;
                    y2 = (y2 + Bridge.Int.clip32(Math.floor((this.grid._Rows.getItem(end1.y).computedSize * i3.itemEndOffset) / 100.0))) | 0;
    
                    x1 = (this.grid._Columns.getItem(start1.x).computedOffset + this.itemsPaddingStart) | 0;
                    x1 = (x1 + Bridge.Int.clip32(i3.computedMarginPct * (((((this.grid._Columns.getItem(start1.x).computedSize - this.itemsPaddingStart) | 0) - this.itemsPaddingEnd) | 0)))) | 0;
    
                    //x2 = Grid.Columns[end.X].ComputedOffset + Grid.Columns[end.X].ComputedSize;
                    x2 = (x1 + Bridge.Int.clip32(i3.computedWidthPct * (((((this.grid._Columns.getItem(start1.x).computedSize - this.itemsPaddingStart) | 0) - this.itemsPaddingEnd) | 0)))) | 0;
    
                    mainItemAxis = this.grid._Columns.getItem(start1.x);
                }
                else  {
                    y1 = (this.grid._Rows.getItem(start1.y).computedOffset + this.itemsPaddingStart) | 0;
                    y1 = (y1 + Bridge.Int.clip32(i3.computedMarginPct * (((((this.grid._Rows.getItem(start1.y).computedSize - this.itemsPaddingStart) | 0) - this.itemsPaddingEnd) | 0)))) | 0;
                    //y2 = Grid.Rows[end.Y].ComputedOffset + Grid.Rows[end.Y].ComputedSize;
                    y2 = (y1 + Bridge.Int.clip32(i3.computedWidthPct * (((((this.grid._Rows.getItem(start1.y).computedSize - this.itemsPaddingStart) | 0) - this.itemsPaddingEnd) | 0)))) | 0;
    
                    x1 = this.grid._Columns.getItem(start1.x).computedOffset;
                    x1 = (x1 + Bridge.Int.clip32(Math.floor((this.grid._Columns.getItem(start1.x).computedSize * i3.itemStartOffset) / 100.0))) | 0;
    
                    x2 = this.grid._Columns.getItem(end1.x).computedOffset;
                    x2 = (x2 + Bridge.Int.clip32(Math.floor((this.grid._Columns.getItem(end1.x).computedSize * i3.itemEndOffset) / 100.0))) | 0;
    
                    mainItemAxis = this.grid._Rows.getItem(start1.y);
                }
    
                if (mainItemAxis.marginStart === 0) {
                    i3.element.classList.remove("has-margin-start");
                }
                else  {
                    i3.element.classList.add("has-margin-start");
                }
                if (mainItemAxis.marginEnd === 0) {
                    i3.element.classList.remove("has-margin-end");
                }
                else  {
                    i3.element.classList.add("has-margin-end");
                }
    
                width = (x2 - x1) | 0;
                height = (y2 - y1) | 0;
    
                i3.element.style.width = width.toString() + "px";
                i3.element.style.height = height.toString() + "px";
                //i.Element.Style.Transform = String.Format("translate({0}px,{1}px)", x1, y1);
                //jQuery.Select(i.Element).Css("transform", String.Format("translate({0}px,{1}px)", x1, y1));
                GridControls.HtmlElementHelper.setTransform(i3.element, Bridge.String.format("translate({0}px,{1}px)", x1, y1));
            }
    
            this._InvalidatedRanges.clear();
        },
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
        calcItemCells: function (cells, item) {
            var start, end;
            var firstAxis = this.flowDirection === GridControls.Axis.column ? this.grid._Columns : this.grid._Rows;
            var secondAxis = this.flowDirection === GridControls.Axis.column ? this.grid._Rows : this.grid._Columns;
    
            start = Bridge.Nullable.hasValue(item.start) ? Bridge.Nullable.getValue(item.start) : 0;
            if (Bridge.Nullable.hasValue(item.paddingStart)) {
                start = (start + Bridge.Nullable.getValue(item.paddingStart)) | 0;
            }
    
            end = Bridge.Nullable.hasValue(item.end) ? Bridge.Nullable.getValue(item.end) : ((secondAxis.getCount() - 1) | 0);
            if (Bridge.Nullable.hasValue(item.paddingEnd)) {
                end = (end - Bridge.Nullable.getValue(item.paddingEnd)) | 0;
            }
    
            item.cells = new Bridge.List$1(GridControls._GridItemCell)();
            if (item.axisIndex < 0 || item.axisIndex >= firstAxis.getCount()) {
                return;
            }
    
            for (var i = Math.max(0, start); i <= Math.min(((secondAxis.getCount() - 1) | 0), end); i = (i + 1) | 0) {
                var x, y;
    
                if (this.flowDirection === GridControls.Axis.column) {
                    x = item.axisIndex;
                    y = i;
                }
                else  {
                    x = i;
                    y = item.axisIndex;
                }
    
                var key = GridControls._GridItemCell.makeKey(x, y);
                if (cells.containsKey(key) === false) {
                    var c = Bridge.merge(new GridControls._GridItemCell(), {
                        setItems: new Bridge.List$1(GridControls._LayerItem)(),
                        x: x,
                        y: y
                    } );
                    c.getItems().add(item);
                    cells.add(key, c);
                    item.cells.add(c);
                }
                else  {
                    var c1 = cells.get(key);
                    c1.getItems().add(item);
                    item.cells.add(c1);
                }
            }
        },
        addItem: function (item) {
            this._Items.add(item.iD, item);
        },
        removeItem: function (id) {
            if (this._Items.containsKey(id) === false) {
                return null;
            }
    
            var item = this._Items.get(id);
            item.layer._InvalidatedRanges.add$1(item.axisIndex);
            var element = item.element;
            this._Items.remove(id);
            item.dispose();
            //InvalidateCells();
            this._InternalLayout();
            return element;
        },
        _GetItemElement: function (id) {
            return this._Items.get(id).element;
        },
        /**
         * MÉTHODE À USAGE INTERNE UNIQUEMENT
         *
         * @instance
         * @public
         * @this GridControls._GridLayer
         * @memberof GridControls._GridLayer
         * @return  {void}
         */
        _Dispose: function () {
            var $t;
            if (!Bridge.hasValue(this.grid)) {
                return;
            }
    
            if (Bridge.hasValue(this._Items)) {
                $t = Bridge.getEnumerator(this._Items.getValues());
                while ($t.moveNext()) {
                    var i = $t.getCurrent();
                    i.dispose();
                }
                this._Items = null;
            }
    
            if (this.grid._Layers.containsKey(this.iD)) {
                this.grid._Layers.remove(this.iD);
            }
    
            this.grid._LayersContainerElement.removeChild(this.layerElement);
            this.grid = null;
            this.layerElement = null;
            this._InvalidatedRanges = null;
            this._Cells = null;
        },
        toString: function () {
            if (!Bridge.hasValue(this.grid)) {
                return "[<NoGrid> Layer " + this.iD.toString() + "]";
            }
            return "[Grid " + this.grid.iD.toString() + " Layer " + this.iD.toString() + "]";
        }
    });
    
    Bridge.ns("GridControls._GridLayer", $_)
    
    Bridge.apply($_.GridControls._GridLayer, {
        f1: function (c) {
            return c.computedSize.toString() + "@" + c.computedOffset.toString();
        },
        f2: function (x) {
            return x.getRangeStart();
        },
        f3: function (cg) {
            return Bridge.Linq.Enumerable.from(cg).last();
        }
    });
    
    Bridge.define('GridControls._GridRange', {
        inherits: [GridControls._GridElement],
        /**
         * taille exprimée selon l'unité choisie
         *
         * @instance
         * @public
         * @memberof GridControls._GridRange
         * @type number
         */
        size: 0,
        /**
         * Unité : px ou %
         *
         * @instance
         * @public
         * @memberof GridControls._GridRange
         * @type string
         */
        sizeUnit: null,
        /**
         * Taille mini de la rangée, en pixels
         *
         * @instance
         * @public
         * @memberof GridControls._GridRange
         * @type number
         */
        minSize: 0,
        maxPctSize: 0,
        data: null,
        /**
         * Taille calculée, ne pas modifier !
         *
         * @instance
         * @memberof GridControls._GridRange
         * @default 0
         * @type number
         */
        computedSize: 0,
        computedOffset: 0,
        hidden: false,
        marginStart: 0,
        marginEnd: 0
    });
    
    /**
     * Classe exposée permettant de définir les coordonnées d'un élément dans le système de grille
     *
     * @public
     * @class GridControls.ItemPosition
     * @augments GridControls._GridElement
     */
    Bridge.define('GridControls.ItemPosition', {
        inherits: [GridControls._GridElement],
        /**
         * Index de la rangée indiquée par la direction de la grille
         *
         * @instance
         * @public
         * @memberof GridControls.ItemPosition
         * @default 0
         * @type number
         */
        axisIndex: 0,
        start: null,
        end: null,
        paddingStart: null,
        paddingEnd: null,
        itemStartOffset: 0,
        itemEndOffset: 100
    });
    
    Bridge.define('GridControls._SchedulerMoveItem', {
        inherits: [GridControls._SchedulerMouseAction],
        _actionData: null,
        x: 0,
        y: 0,
        _ItemsElements: null,
        _OriginalValues: "",
        _ProcessMouseMoveEvent: function (evt) {
            if (!Bridge.hasValue(this._ItemsElements)) {
                return false;
            }
    
            //  calcul de la nouvelle position du 1er élément
            var calendarID = { v : null };
            var hour = { v : 0 };
            var minute = { v : 0 };
            var dayIndex = { v : 0 };
    
            if (this._CurrentScheduler._GetSchedulerPositionFromClientCoordinates(evt.clientX, evt.clientY, calendarID, hour, minute, dayIndex)) {
                if (this._actionData.allowCalendarChange === false) {
                    calendarID.v = this._Items.getItem(0).calendarID;
                }
    
                minute.v = (minute.v - (minute.v % this._actionData.step)) | 0;
    
                if (this._actionData.allowTimeChange === false) {
                    hour.v = this._Items.getItem(0).itemDate.getHours();
                    minute.v = this._Items.getItem(0).itemDate.getMinutes();
                }
    
                var newDateTime = new Date(this._CurrentScheduler.get_DateFilter().getFullYear(), (this._CurrentScheduler.get_DateFilter().getMonth() + 1) - 1, this._CurrentScheduler.get_DateFilter().getDate(), hour.v, minute.v);
                newDateTime = new Date(newDateTime.valueOf() + Math.round((dayIndex.v) * 864e5));
    
                /* if (_actionData.AllowTimeChange == false && (newDateTime.Hour != _Items[0].ItemDate.Hour || newDateTime.Minute != _Items[0].ItemDate.Minute))
                        return true;
                        */
                if (this._actionData.allowDateChange === false) {
                    if (!Bridge.equals(new Date(newDateTime.getFullYear(), newDateTime.getMonth(), newDateTime.getDate()), new Date(this._Items.getItem(0).itemDate.getFullYear(), this._Items.getItem(0).itemDate.getMonth(), this._Items.getItem(0).itemDate.getDate()))) {
                        return true;
                    }
                }
    
                if (this._Items.getItem(0).calendarID !== calendarID.v || !Bridge.equals(this._Items.getItem(0).itemDate, newDateTime)) {
                    var dateStep = Bridge.Date.subdd(newDateTime, this._Items.getItem(0).itemDate);
                    var calendarStep = (Bridge.Linq.Enumerable.from(this._CurrentScheduler._DataSource.getCalendars()).select($_.GridControls._SchedulerMoveItem.f1).indexOf(calendarID.v) - Bridge.Linq.Enumerable.from(this._CurrentScheduler._DataSource.getCalendars()).select($_.GridControls._SchedulerMoveItem.f1).indexOf(this._Items.getItem(0).calendarID)) | 0;
    
                    var calendars = new Bridge.List$1(String)();
                    var datetimes = new Bridge.List$1(Date)();
    
                    for (var i = 0; i < this._Items.getCount(); i = (i + 1) | 0) {
                        if (i === 0) {
                            calendars.add(calendarID.v);
                            datetimes.add(newDateTime);
                        }
                        else  {
                            var calendarIndex = (Bridge.Linq.Enumerable.from(this._CurrentScheduler._DataSource.getCalendars()).select($_.GridControls._SchedulerMoveItem.f1).indexOf(this._Items.getItem(i).calendarID) + calendarStep) | 0;
                            if (calendarIndex < 0 || calendarIndex >= this._CurrentScheduler._DataSource.getCalendars().length) {
                                return true;
                            }
    
                            calendars.add(this._CurrentScheduler._DataSource.getCalendars()[calendarIndex].iD);
                            datetimes.add(new Date((this._Items.getItem(i).itemDate).getTime() + ((dateStep).ticks.div(10000).toNumber())));
                            if (this._actionData.allowDateChange === false && !Bridge.equals(new Date(newDateTime.getFullYear(), newDateTime.getMonth(), newDateTime.getDate()), new Date(this._Items.getItem(0).itemDate.getFullYear(), this._Items.getItem(0).itemDate.getMonth(), this._Items.getItem(0).itemDate.getDate()))) {
                                return true;
                            }
                        }
    
                        if (!this._CanChangeApppintment(this._actionData.allowedTimeRanges, calendars.getItem(i), datetimes.getItem(i), this._Items.getItem(i).duration)) {
                            return true;
                        }
                    }
    
                    this._CurrentScheduler._DataSource.suspendAllLayouts();
                    var updatedObjects = new Bridge.List$1(Object)();
                    for (var i1 = 0; i1 < this._Items.getCount(); i1 = (i1 + 1) | 0) {
                        this._Items.getItem(i1).calendarID = calendars.getItem(i1);
                        this._Items.getItem(i1).itemDate = datetimes.getItem(i1);
                        this._CurrentScheduler._DataSource._UpdateItemObject(this._Items.getItem(i1));
                        updatedObjects.add(this._Items.getItem(i1).itemObject);
                    }
    
                    this._CurrentScheduler._DataSource.addOrUpdateItems(updatedObjects.toArray());
                    this._CurrentScheduler._DataSource.resumeAllLayouts();
                }
            }
    
    
            return true;
        },
        getComparisonString: function () {
            if (!Bridge.hasValue(this._Items)) {
                return "";
            }
            return Bridge.toArray(Bridge.Linq.Enumerable.from(this._Items).select($_.GridControls._SchedulerMoveItem.f2)).join(",");
        },
        _Initialize: function (evt) {
            var $t;
            this.x = evt.clientX;
            this.y = evt.clientY;
    
            this._ItemsElements = new Bridge.Dictionary$2(Bridge.Int32,HTMLElement)();
            $t = Bridge.getEnumerator(this._Items);
            while ($t.moveNext()) {
                var item = $t.getCurrent();
                var container = this._SourceScheduler.getItemContainer(item.itemObject);
                this._ItemsElements.add(item._InternalID, container);
            }
    
            this._OriginalValues = this.getComparisonString();
        },
        _OnStop: function () {
            if (!Bridge.hasValue(this._ItemsElements)) {
                return;
            }
    
            if (this._OriginalValues !== this.getComparisonString() === false && Bridge.hasValue(this._CurrentScheduler)) {
                if (Bridge.hasValue(this._CurrentScheduler._Options.callbacks.onItemsChanged)) {
                    this._CurrentScheduler._Options.callbacks.onItemsChanged(this._CurrentScheduler, Bridge.Linq.Enumerable.from(this._Items).select($_.GridControls._SchedulerMoveItem.f3).toArray());
                }
            }
    
            if (Bridge.hasValue(this._CurrentScheduler) && Bridge.hasValue(this._CurrentScheduler._Options.callbacks.onMoveItemsStopped)) {
                this._CurrentScheduler._Options.callbacks.onMoveItemsStopped(this._CurrentScheduler, Bridge.Linq.Enumerable.from(this._Items).select($_.GridControls._SchedulerMoveItem.f3).toArray());
            }
    
            this._ItemsElements = null;
            this._actionData = null;
        },
        _SetActionData: function (data) {
            this._actionData = Bridge.as(data, GridControls.SchedulerMoveItemsEventArgs);
        }
    });
    
    Bridge.ns("GridControls._SchedulerMoveItem", $_)
    
    Bridge.apply($_.GridControls._SchedulerMoveItem, {
        f1: function (c) {
            return c.iD;
        },
        f2: function (i) {
            return i.itemDate.toDateString() + "/" + i.itemDate.toTimeString().toString();
        },
        f3: function (i) {
            return i.itemObject;
        }
    });
    
    Bridge.define('GridControls._SchedulerResizeItem', {
        inherits: [GridControls._SchedulerMouseAction],
        _actionData: null,
        x: 0,
        y: 0,
        _ItemsElements: null,
        _LastDuration: null,
        _OriginalValues: "",
        _ProcessMouseMoveEvent: function (evt) {
            if (!Bridge.hasValue(this._ItemsElements)) {
                return false;
            }
    
            //  calcul de la nouvelle durée
            var calendarID = { v : null };
            var hour = { v : 0 };
            var minute = { v : 0 };
            var dayIndex = { v : 0 };
    
            if (this._CurrentScheduler._GetSchedulerPositionFromClientCoordinates(evt.clientX, evt.clientY, calendarID, hour, minute, dayIndex)) {
                minute.v = (minute.v - (minute.v % this._actionData.step)) | 0;
                var newDateTime = new Date(this._CurrentScheduler.get_DateFilter().getFullYear(), (this._CurrentScheduler.get_DateFilter().getMonth() + 1) - 1, this._CurrentScheduler.get_DateFilter().getDate(), hour.v, minute.v);
                newDateTime = new Date(newDateTime.valueOf() + Math.round((dayIndex.v) * 864e5));
    
                var duration = Bridge.Int.clip32(Bridge.Date.subdd(newDateTime, this._Items.getItem(0).itemDate).getTotalMinutes());
    
                if (Bridge.Nullable.hasValue(this._LastDuration) === false) {
                    this._LastDuration = duration;
                }
                else  {
                    if (Bridge.Nullable.getValue(this._LastDuration) !== duration) {
                        this._LastDuration = duration;
                        if (duration < this._actionData.minDuration) {
                            duration = this._actionData.minDuration;
                        }
    
                        if (this._Items.getItem(0).duration !== duration) {
                            //  On essaie d'occuper l'aspace maxi par rapport à ce qui est demandé
                            do  {
                                if (this._CanChangeApppintment(this._actionData.allowedTimeRanges, calendarID.v, this._Items.getItem(0).itemDate, duration)) {
                                    this._Items.getItem(0).duration = duration;
    
                                    //  bornes : en fonction des droits (changements d'heure/de calendrier) et des plages horaires
                                    this._CurrentScheduler._DataSource._UpdateItemObject(this._Items.getItem(0));
                                    this._CurrentScheduler._DataSource.addOrUpdateItem(this._Items.getItem(0).itemObject);
                                    break;
                                }
                                else  {
                                    duration = (duration - this._actionData.step) | 0;
                                }
                            } while (duration >= this._Items.getItem(0).duration);
                        }
                    }
                }
            }
    
    
            return true;
        },
        getComparisonString: function () {
            if (!Bridge.hasValue(this._Items)) {
                return "";
            }
            return Bridge.toArray(Bridge.Linq.Enumerable.from(this._Items).select($_.GridControls._SchedulerResizeItem.f1)).join(",");
        },
        _Initialize: function (evt) {
            var $t;
            this.x = evt.clientX;
            this.y = evt.clientY;
    
            this._ItemsElements = new Bridge.Dictionary$2(Bridge.Int32,HTMLElement)();
            $t = Bridge.getEnumerator(this._Items);
            while ($t.moveNext()) {
                var item = $t.getCurrent();
                var container = this._SourceScheduler.getItemContainer(item.itemObject);
                this._ItemsElements.add(item._InternalID, container);
            }
            this._OriginalValues = this.getComparisonString();
        },
        _OnStop: function () {
            if (!Bridge.hasValue(this._ItemsElements)) {
                return;
            }
    
            if (this._OriginalValues !== this.getComparisonString() === false && Bridge.hasValue(this._CurrentScheduler)) {
                if (Bridge.hasValue(this._CurrentScheduler._Options.callbacks.onItemsChanged)) {
                    this._CurrentScheduler._Options.callbacks.onItemsChanged(this._CurrentScheduler, Bridge.Linq.Enumerable.from(this._Items).select($_.GridControls._SchedulerResizeItem.f2).toArray());
                }
            }
    
            if (Bridge.hasValue(this._CurrentScheduler) && Bridge.hasValue(this._CurrentScheduler._Options.callbacks.onResizeItemsStopped)) {
                this._CurrentScheduler._Options.callbacks.onResizeItemsStopped(this._CurrentScheduler, Bridge.Linq.Enumerable.from(this._Items).select($_.GridControls._SchedulerResizeItem.f2).toArray());
            }
    
            this._ItemsElements = null;
            this._actionData = null;
        },
        _SetActionData: function (data) {
            this._actionData = Bridge.as(data, GridControls.SchedulerResizeItemEventArgs);
        }
    });
    
    Bridge.ns("GridControls._SchedulerResizeItem", $_)
    
    Bridge.apply($_.GridControls._SchedulerResizeItem, {
        f1: function (i) {
            return i.duration.toString();
        },
        f2: function (i) {
            return i.itemObject;
        }
    });
    
    Bridge.define('GridControls.Action_ClickBase', {
        inherits: [GridControls._ActionReconizer],
        _NumDetections: 0,
        _TimeOut: Bridge.Long.lift(null),
        _LastMouseDown: Bridge.Long.lift(null),
        _LastMouseUp: Bridge.Long.lift(null),
        constructor: function (surface) {
            GridControls._ActionReconizer.prototype.$constructor.call(this, surface);
    
        },
        cancel: function () {
            this._NumDetections = 0;
            this._TimeOut = Bridge.Long.lift(null);
            this._LastMouseDown = Bridge.Long.lift(null);
            this._LastMouseUp = Bridge.Long.lift(null);
            GridControls._ActionReconizer.prototype.cancel.call(this);
        },
        _DetectGesture: function (newEvent) {
            if (Bridge.Nullable.hasValue(this._TimeOut) && Bridge.Long((new Date()).getTime()).gt(Bridge.Nullable.getValue(this._TimeOut))) {
                console.log("timeout");
                this.cancel();
                return;
            }
    
            if (this._NumDetections === this.getNumClicks() && Bridge.Long((new Date()).getTime()).sub(Bridge.Nullable.getValue(this._LastMouseUp)).gte(Bridge.Long(this.getReleaseDelayMin()))) {
                console.log("DETECTED");
                this.onDetected(this._BoundElement);
                this.cancel();
                return;
            }
    
            if (newEvent === false) {
                return;
            }
    
            var last = Bridge.Linq.Enumerable.from(this._Sequence).last();
    
            //  Pas de déplacement excessif
            if (this._Sequence.getCount() > 1) {
                var first = this._Sequence.getItem(0);
                if (Math.abs(((last.pageX - first.pageX) | 0)) > 3 || Math.abs(((last.pageY - first.pageY) | 0)) > 3) {
                    console.log("moved");
                    this.cancel();
                    return;
                }
            }
            if (last.state === GridControls._ActionReconizerState.move) {
                return;
            }
    
            //  On doit survoler le même élément qu'au début
            if (Bridge.hasValue(this.bind) && Bridge.hasValue(this._BoundElement) && this.bind(last.originalEvent) !== this._BoundElement) {
                console.log("binding changed");
                this.cancel();
                return;
            }
    
            //---------------
            //  Mouse DOWN
            if (Bridge.Nullable.hasValue(this._LastMouseDown) === false) {
                if (this._NumDetections >= this.getNumClicks()) {
                    console.log("too many clicks");
                    this.cancel();
                    return;
                }
    
                //  up...
                if (Bridge.Linq.Enumerable.from(this._Sequence).last().state !== GridControls._ActionReconizerState.down) {
                    console.log("down bad state");
                    this.cancel();
                    return;
                }
    
                if (Bridge.hasValue(this.bind) && this._NumDetections === 0) {
                    this._BoundElement = this.bind(Bridge.Linq.Enumerable.from(this._Sequence).last().originalEvent);
                    if (!Bridge.hasValue(this._BoundElement)) {
                        console.log("no element to bind");
                        this.cancel();
                        return;
                    }
                }
    
                this._LastMouseDown = Bridge.Long((new Date()).getTime());
                console.log("-- DOWN OK : " + Bridge.Nullable.getValue(this._LastMouseDown));
                this._LastMouseUp = Bridge.Long.lift(null);
                this._TimeOut = Bridge.Long((new Date()).getTime()).add(Bridge.Long(this.getPressDelayMax()));
                return;
            }
    
            //---------------
            //  Mouse UP
            if (Bridge.Linq.Enumerable.from(this._Sequence).last().state !== GridControls._ActionReconizerState.up) {
                console.log("up bad state");
                this.cancel();
                return;
            }
    
            //  délai mini d'appui
            if (Bridge.Long((new Date()).getTime()).sub(Bridge.Nullable.getValue(this._LastMouseDown)).lt(Bridge.Long(this.getPressDelayMin()))) {
                console.log("press delay : " + Bridge.Long((new Date()).getTime()).toString() + " // " + Bridge.Long(((new Date())).getTime()).toString() + " // " + Bridge.Nullable.getValue(this._LastMouseDown).toString());
                this.cancel();
                return;
            }
    
            console.log("-- UP OK");
            this._NumDetections = (this._NumDetections + 1) | 0;
            this._LastMouseUp = Bridge.Long((new Date()).getTime());
            this._LastMouseDown = Bridge.Long.lift(null);
            this._TimeOut = Bridge.Long((new Date()).getTime()).add(Bridge.Long(this.getDelayBetweenClicksMax()));
    
            if (this._NumDetections === this.getNumClicks() && this.getReleaseDelayMin() === 0) {
                console.log("DETECTED #2");
                this.onDetected(this._BoundElement);
                this.cancel();
                return;
            }
        }
    });
    
    Bridge.define('GridControls.Action_DragAndDrop', {
        inherits: [GridControls._ActionReconizer],
        constructor: function (surface) {
            GridControls._ActionReconizer.prototype.$constructor.call(this, surface);
    
        },
        _ShouldProcessEvent: function (evt, state) {
            return GridControls._ActionReconizer.prototype._ShouldProcessEvent.call(this, evt, state);
        },
        _DetectGesture: function (newEvent) {
            throw new Bridge.NotImplementedException();
        }
    });
    
    Bridge.define('GridControls.Table', {
        inherits: [GridControls.CompositeGrid],
        constructor: function (host) {
            GridControls.CompositeGrid.prototype.$constructor.call(this, host);
    
        },
        populate: function () {
        }
    });
    
    Bridge.define('GridControls._BaseGrid', {
        inherits: [GridControls._BaseControl],
        identifier: "<unset>",
        _Options: null,
        _ViewPortElement: null,
        _LayersContainerElement: null,
        _Layers: null,
        _ViewPortRef: null,
        _Rows: null,
        _Columns: null,
        scrollChangedCallback: null,
        _LayoutLocks: 0,
        _LayoutRequested: false,
        m_OldLayoutSettings: "",
        m_ScrollToX: null,
        m_ScrollToY: null,
        config: {
            init: function () {
                this._Layers = new Bridge.Dictionary$2(Bridge.Int32,GridControls._GridLayer)();
            }
        },
        constructor: function (options, identifier) {
            if (options === void 0) { options = null; }
            if (identifier === void 0) { identifier = null; }
    
            GridControls._BaseControl.prototype.$constructor.call(this);
            var $t;
    
            if (Bridge.String.isNullOrEmpty(identifier) === false) {
                this.identifier = identifier;
            }
    
            this._Rows = new Bridge.List$1(GridControls._GridRange)();
            this._Columns = new Bridge.List$1(GridControls._GridRange)();
    
            this._Options = ($t = options, Bridge.hasValue($t) ? $t : new GridControls.GridOptions());
    
            //  Viewport (zone scrollable)
            this._ViewPortElement = document.createElement('div');
            this._ViewPortElement.style.width = "100%";
            this._ViewPortElement.style.height = "100%";
            if (this._Options.scrollDisabled) {
                this._ViewPortElement.style.overflow = "hidden";
            }
            else  {
                this._ViewPortElement.style.overflow = "auto";
            }
            this._ViewPortElement.style.position = "relative";
            this._ViewPortElement.style.margin = "0";
            this._ViewPortElement.style.padding = "0";
            this._ViewPortElement.classList.add("grid-viewport");
    
            //  Et contenu (la vue qui défile dans la zone scrollable)
            this._LayersContainerElement = document.createElement('div');
            this._LayersContainerElement.style.position = "relative";
            this._LayersContainerElement.style.overflow = "hidden";
            this._LayersContainerElement.style.margin = "0";
            this._LayersContainerElement.style.padding = "0";
            this._LayersContainerElement.classList.add("grid-layers-container");
            this._ViewPortElement.appendChild(this._LayersContainerElement);
    
            if (this._Options.scrollDisabled === false && Bridge.hasValue(GridControls.GridOptions.bindCustomScrollbars)) {
                GridControls.GridOptions.bindCustomScrollbars(this._ViewPortElement);
            }
    },
    getNumRows: function () {
        return this._Rows.getCount();
    },
    getNumColumns: function () {
        return this._Columns.getCount();
    },
    get_ControlElement: function () {
        return this._ViewPortElement;
    },
    getIsLayoutSuspended: function () {
        return this._LayoutLocks > 0;
    },
    /**
     * Désactive le layouting automatique
     *
     * @instance
     * @public
     * @this GridControls._BaseGrid
     * @memberof GridControls._BaseGrid
     * @return  {void}
     */
    suspendLayout: function () {
        this._LayoutLocks = (this._LayoutLocks + 1) | 0;
    },
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
    resumeLayout: function () {
        this._LayoutLocks = (this._LayoutLocks - 1) | 0;
        if (this.getIsLayoutSuspended() === false) {
            this.layout(true);
        }
    },
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
    setColumnWidth: function (columnIndex, width, unit, minWidth) {
        if (unit === void 0) { unit = "px"; }
        if (minWidth === void 0) { minWidth = 0; }
        this._Columns.getItem(columnIndex).size = width;
        this._Columns.getItem(columnIndex).sizeUnit = unit;
        this._Columns.getItem(columnIndex).minSize = minWidth;
    
        this._Columns.getItem(columnIndex).hidden = width === 0;
    
        this._LayoutRequested = true;
    
        this.layout(true);
    },
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
    setColumnMargins: function (columnIndex, marginLeft, marginRight) {
        this._Columns.getItem(columnIndex).marginStart = marginLeft;
        this._Columns.getItem(columnIndex).marginEnd = marginRight;
    
        this._LayoutRequested = true;
    
        this.layout(true);
    },
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
    setRowHeight: function (rowIndex, height, unit, minHeight) {
        if (unit === void 0) { unit = "px"; }
        if (minHeight === void 0) { minHeight = 0; }
        this._Rows.getItem(rowIndex).size = height;
        this._Rows.getItem(rowIndex).sizeUnit = unit;
        this._Rows.getItem(rowIndex).minSize = minHeight;
    
        this._Rows.getItem(rowIndex).hidden = height === 0;
    
        this._LayoutRequested = true;
        this.layout(true);
    },
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
    setRowMargins: function (rowIndex, marginTop, marginBottom) {
        this._Rows.getItem(rowIndex).marginStart = marginTop;
        this._Rows.getItem(rowIndex).marginEnd = marginBottom;
    
        this._LayoutRequested = true;
    
        this.layout(true);
    },
    _ComputeAxisRangesSize: function (ranges, viewPortSize) {
        if (viewPortSize === 0) {
            for (var i = 0; i < ranges.getCount(); i = (i + 1) | 0) {
                ranges.getItem(i).computedOffset = 0;
                ranges.getItem(i).computedSize = 0;
            }
            return 0;
        }
    
        var total = 0;
        var stars = new Bridge.List$1(Bridge.Int32)();
        var totalStars = 0;
    
        for (var i1 = 0; i1 < ranges.getCount(); i1 = (i1 + 1) | 0) {
            var r = ranges.getItem(i1);
            if (r.hidden) {
                r.computedSize = 0;
                continue;
            }
    
            var current;
            if (Bridge.String.equals(r.sizeUnit, "*")) {
                totalStars += r.size;
                stars.add(i1);
                continue;
            }
    
            if (Bridge.String.equals(r.sizeUnit, "%")) {
                current = ((r.size * viewPortSize) / 100.0);
            }
            else  {
                current = r.size;
            }
    
            if (current < r.minSize) {
                current = r.minSize;
            }
            else  {
                if (r.maxPctSize > 0) {
                    if (current > ((viewPortSize * r.maxPctSize) | 0) / 100.0) {
                        current = ((viewPortSize * r.maxPctSize) | 0) / 100.0;
                    }
                }
            }
    
            current = Math.floor(current);
    
            r.computedSize = Bridge.Int.clip32(current);
            total = (total + r.computedSize) | 0;
        }
    
        total = (viewPortSize - total) | 0;
        var starsSize = 0;
        for (var i2 = 0; i2 < stars.getCount(); i2 = (i2 + 1) | 0) {
            var s;
            if (i2 === ((stars.getCount() - 1) | 0)) {
                s = (total - starsSize) | 0;
            }
            else  {
                s = Bridge.Int.clip32(Math.floor(total * ranges.getItem(stars.getItem(i2)).size / totalStars));
            }
            starsSize = (starsSize + s) | 0;
    
            if (s < ranges.getItem(stars.getItem(i2)).minSize) {
                s = ranges.getItem(stars.getItem(i2)).minSize;
            }
            ranges.getItem(stars.getItem(i2)).computedSize = s;
        }
    
        var offset = 0;
        for (var i3 = 0; i3 < ranges.getCount(); i3 = (i3 + 1) | 0) {
            if (ranges.getItem(i3).hidden === false && ranges.getItem(i3).computedSize > 0) {
                offset = (offset + ranges.getItem(i3).marginStart) | 0;
            }
    
            ranges.getItem(i3).computedOffset = offset;
            offset = (offset + ranges.getItem(i3).computedSize) | 0;
    
            if (ranges.getItem(i3).hidden === false && ranges.getItem(i3).computedSize > 0) {
                offset = (offset + ranges.getItem(i3).marginEnd) | 0;
            }
        }
    
        return offset;
    },
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
    layout: function (force) {
        var $t, $t1;
        if (force === void 0) { force = false; }
        if (this.getIsLayoutSuspended()) {
            this._LayoutRequested = true;
            return;
        }
    
        if (this._LayoutRequested) {
            force = true;
        }
    
        this._LayoutRequested = false;
        if (force) {
            this.m_OldLayoutSettings = "";
        }
    
        if (this.getIsAttached() === false) {
            return;
        }
    
        //  on garde une chaine avec toutes les valeurs dont dépend le layout
        var layoutSettings = this._HostElement.clientWidth.toString() + "/" + this._HostElement.clientHeight.toString();
    
        //  Si rien n'a changé, il est inutile de refaire tous les calculs
        if (Bridge.String.equals(this.m_OldLayoutSettings, layoutSettings)) {
            return;
        }
        this.m_OldLayoutSettings = layoutSettings;
    
        //  Calcul des tailles des rangées et changement de la taille de la zone scrollable
        var elemRef = ($t = this._ViewPortRef, Bridge.hasValue($t) ? $t : this._HostElement);
        this._LayersContainerElement.style.width = this._ComputeAxisRangesSize(this._Columns, elemRef.clientWidth) + "px";
        this._LayersContainerElement.style.height = this._ComputeAxisRangesSize(this._Rows, elemRef.clientHeight) + "px";
    
        //  on envoie ensuite la demande de layouting à chaque layer
        $t1 = Bridge.getEnumerator(this._Layers.getValues());
        while ($t1.moveNext()) {
            var layer = $t1.getCurrent();
            layer._InternalLayout();
        }
    
        if (this._Options.scrollDisabled === false && Bridge.hasValue(GridControls.GridOptions.updateCustomScrollbars)) {
            GridControls.GridOptions.updateCustomScrollbars(this._ViewPortElement);
        }
    
        if (Bridge.hasValue(this._Options.onLayout)) {
            this._Options.onLayout(this);
        }
    
        $(this._LayersContainerElement).find(".iwc-grid-class").each(function (i, e) {
            GridControls.Grid.query(e).layout(force);
        });
    },
    _OnWindowSizeChanged: function () {
        this.layout();
    },
    _OnViewportScrollChanged: function (e) {
        if (!Bridge.hasValue(e.originalEvent)) {
            return;
        }
    
        if (Bridge.hasValue(this._Options.onScrollChanged)) {
            this._Options.onScrollChanged(this, this._ViewPortElement);
        }
    
        if (!Bridge.hasValue(this.scrollChangedCallback)) {
            return;
        }
    
        var jViewportElement = $(this._ViewPortElement);
        var scrollPositionX = jViewportElement.scrollLeft();
        var scrollPositionY = jViewportElement.scrollTop();
    
        this.scrollChangedCallback(this, scrollPositionX, scrollPositionY);
    },
    _BindEvents: function () {
        if (this._Options._AutoLayout) {
            $(window).bind("resize", Bridge.fn.bind(this, this._OnWindowSizeChanged));
        }
    
        $(this._ViewPortElement).on("scroll", Bridge.fn.bind(this, this._OnViewportScrollChanged));
    },
    _UnbindEvents: function () {
        if (this._Options._AutoLayout) {
            $(window).unbind("resize", Bridge.fn.bind(this, this._OnWindowSizeChanged));
        }
    
        $(this._ViewPortElement).off("scroll");
    },
    _SetScrollPosition: function () {
        var properties = { };
        var element = $(this._ViewPortElement);
    
        if (Bridge.Nullable.hasValue(this.m_ScrollToX)) {
            element.scrollLeft(Bridge.Nullable.getValue(this.m_ScrollToX));
        }
        //properties.scrollLeft = m_ScrollToX.Value;
        if (Bridge.Nullable.hasValue(this.m_ScrollToY)) {
            element.scrollTop(Bridge.Nullable.getValue(this.m_ScrollToY));
        }
    
        this.m_ScrollToX = null;
        this.m_ScrollToY = null;
        //properties.scrollTop = m_ScrollToY.Value;
    
        /* 
                
                EffectOptions options = new EffectOptions();
                options.Easing = "linear";
                options.DurationString = "fast";
                options.Queue = false;
                
                options.Complete = () =>
                {
                    m_ScrollToX = null;
                    m_ScrollToY = null;
                    if (_Options.ScrollDisabled == false && GridOptions.UpdateCustomScrollbars != null)
                        GridOptions.UpdateCustomScrollbars(_ViewPortElement);
                };
                options.Progress = (promise, percent, remaining) =>
                {
                    if (_Options.ScrollDisabled == false && GridOptions.UpdateCustomScrollbars != null)
                        GridOptions.UpdateCustomScrollbars(_ViewPortElement);
                };
                element.Stop().Animate(properties, "fast");*/
    
        if (this._Options.scrollDisabled === false && Bridge.hasValue(GridControls.GridOptions.updateCustomScrollbars)) {
            GridControls.GridOptions.updateCustomScrollbars(this._ViewPortElement);
        }
    },
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
    setHScrollPosition: function (offset) {
        if ($(this._ViewPortElement).scrollLeft() === offset) {
            return;
        }
    
        this.m_ScrollToX = offset;
        this._SetScrollPosition();
        //jQuery.Select(_ViewPortElement).ScrollLeft(offset);
        //if (_Options.ScrollDisabled == false && GridOptions.UpdateCustomScrollbars != null)
        //    GridOptions.UpdateCustomScrollbars(_ViewPortElement);
    },
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
    setVScrollPosition: function (offset) {
        if ($(this._ViewPortElement).scrollTop() === offset) {
            return;
        }
    
        this.m_ScrollToY = offset;
        this._SetScrollPosition();
    
        //jQuery.Select(_ViewPortElement).ScrollTop(offset);
        //if (_Options.ScrollDisabled == false && GridOptions.UpdateCustomScrollbars != null)
        //    GridOptions.UpdateCustomScrollbars(_ViewPortElement);
    },
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
    detach: function () {
        if (this.getIsAttached()) {
            //  On change d'élement hôte : on retire le viewport de l'ancien hote et on continue normalement
            $(this._HostElement).data("iwc-grid-class", null).removeClass("iwc-grid-class");
            this._UnbindEvents();
        }
    
        GridControls._BaseControl.prototype.detach.call(this);
    },
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
    attach: function (host) {
        GridControls._BaseControl.prototype.attach.call(this, host);
    
        //  Nouveau container vidé de tout élément indésirable
        $(this._HostElement).empty();
    
        //  rattachement
        host.appendChild(this._ViewPortElement);
    
        //  sauvegarde de la référence de l'objet
        $(this._HostElement).data("iwc-grid-class", this).addClass("iwc-grid-class");
    
        //  on se met en écoute d'un éventuel rezising de la fenêtre
        this._BindEvents();
    
        //  et on force un layout
        this.layout(true);
    },
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
    destroy: function () {
        if (Bridge.hasValue(this._Options) && this._Options.scrollDisabled === false && Bridge.hasValue(this._ViewPortElement) && Bridge.hasValue(GridControls.GridOptions.unbindCustomScrollbars)) {
            GridControls.GridOptions.unbindCustomScrollbars(this._ViewPortElement);
        }
    
        this._Options = null;
        this.scrollChangedCallback = null;
        this._HostElement = null;
        this._LayersContainerElement = null;
        this._Layers = null;
        this._Rows = null;
        this._Columns = null;
    
        GridControls._BaseControl.prototype.destroy.call(this);
        this._ViewPortElement = null;
    }
    });
    
    Bridge.define('GridControls._LayerItem', {
        inherits: [GridControls.ItemPosition],
        layer: null,
        element: null,
        data: null,
        computedMarginPct: 0,
        computedWidthPct: 0,
        groupCount: 1,
        groupIndex: 0,
        onCreated: null,
        onLayout: null,
        cells: null,
        constructor: function (layer) {
            GridControls.ItemPosition.prototype.$constructor.call(this);
    
            this.layer = layer;
    
            this.element = document.createElement('div');
            this.element.style.position = "absolute";
            this.element.classList.add("grid-item");
            this.element.dataset.gridelementid = this.iD.toString();
            layer.layerElement.appendChild(this.element);
        },
        getRangeStart: function () {
            var p = 0;
            if (Bridge.Nullable.hasValue(this.start)) {
                p = Bridge.Nullable.getValue(this.start);
            }
            if (Bridge.Nullable.hasValue(this.paddingStart)) {
                p += Bridge.Nullable.getValue(this.paddingStart);
            }
            p *= 100;
            p += this.itemStartOffset;
            return p;
        },
        getRangeEnd: function () {
            var p = 0;
            if (Bridge.Nullable.hasValue(this.end)) {
                p = Bridge.Nullable.getValue(this.end);
            }
            else  {
                if (this.layer.flowDirection === GridControls.Axis.column) {
                    p = (this.layer.grid._Columns.getCount() - 1) | 0;
                }
                else  {
                    p = (this.layer.grid._Rows.getCount() - 1) | 0;
                }
            }
            if (Bridge.Nullable.hasValue(this.paddingEnd)) {
                p -= Bridge.Nullable.getValue(this.paddingEnd);
            }
            p *= 100;
            p += this.itemEndOffset;
            return p;
        },
        /**
         * MÉTHODE À USAGE INTERNE UNIQUEMENT
         *
         * @instance
         * @public
         * @this GridControls._LayerItem
         * @memberof GridControls._LayerItem
         * @return  {void}
         */
        dispose: function () {
            if (!Bridge.hasValue(this.layer) || !Bridge.hasValue(this.element)) {
                return;
            }
    
            if (Bridge.hasValue(this.layer.layerElement)) {
                this.layer.layerElement.removeChild(this.element);
            }
            this.layer = null;
            this.element = null;
            this.data = null;
            this.onCreated = null;
            this.onLayout = null;
            this.cells = null;
        }
    });
    
    Bridge.define('GridControls.Action_Click', {
        inherits: [GridControls.Action_ClickBase],
        constructor: function (surface) {
            GridControls.Action_ClickBase.prototype.$constructor.call(this, surface);
    
        },
        getPressDelayMax: function () {
            return 250;
        },
        getPressDelayMin: function () {
            return 0;
        },
        getReleaseDelayMin: function () {
            return 250;
        },
        getNumClicks: function () {
            return 1;
        },
        getDelayBetweenClicksMax: function () {
            return 0;
        }
    });
    
    Bridge.define('GridControls.Action_DoubleClick', {
        inherits: [GridControls.Action_ClickBase],
        constructor: function (surface) {
            GridControls.Action_ClickBase.prototype.$constructor.call(this, surface);
    
        },
        getPressDelayMax: function () {
            return 250;
        },
        getPressDelayMin: function () {
            return 0;
        },
        getReleaseDelayMin: function () {
            return 0;
        },
        getNumClicks: function () {
            return 2;
        },
        getDelayBetweenClicksMax: function () {
            return 250;
        }
    });
    
    Bridge.define('GridControls.Action_LongClick', {
        inherits: [GridControls.Action_ClickBase],
        constructor: function (surface) {
            GridControls.Action_ClickBase.prototype.$constructor.call(this, surface);
    
        },
        getPressDelayMax: function () {
            return 5000;
        },
        getPressDelayMin: function () {
            return 300;
        },
        getReleaseDelayMin: function () {
            return 0;
        },
        getNumClicks: function () {
            return 1;
        },
        getDelayBetweenClicksMax: function () {
            return 0;
        }
    });
    
    Bridge.define('GridControls.Scheduler', {
        inherits: [GridControls._BaseControl,GridControls._ISchedulerDataReceiver],
        statics: {
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
            create: function (options) {
                return new GridControls.Scheduler(options);
            }
        },
        _LayoutGridElement: null,
        _LayoutGrid: null,
        _HoursHeadersCells: null,
        _CurrentTimeTimer: null,
        _CurrentTimeElements: null,
        _LayoutElements: null,
        m_SchedulerGrids: null,
        _currentMouseAction: null,
        _CalendarsLayout: null,
        /**
         * Elements de RDV actuellement affichés : clé=item rdv, valeur=id de l'élément de grid
         *
         * @instance
         * @private
         * @memberof GridControls.Scheduler
         * @type Bridge.Dictionary$2
         */
        _DisplayedItems: null,
        _LastItemsUpdates: null,
        _GridLinesLayerCreated: false,
        _Options: null,
        _DataSource: null,
        m_UpdateCurrentTimeDisabled: false,
        m_UpdateCurrentTimeRequested: false,
        m_LastTouchedViewPort: null,
        _RunningAjaxRequests: 0,
        _LayoutSuspendCount: 1,
        _DoubleClickTimer: null,
        _SynchingScrollers: false,
        _ElementsToMove: null,
        _AllowMouseEvents: true,
        _WaitForMouseDown: true,
        _ClickDisabled: false,
        _LastCLickX: -1000,
        _LastCLickY: -1000,
        config: {
            init: function () {
                this._HoursHeadersCells = new Bridge.List$1(Bridge.Int32)();
                this._CurrentTimeElements = new Bridge.List$1(HTMLElement)();
                this._LayoutElements = new Bridge.List$1(GridControls._SchedulerLayoutElement)();
                this.m_SchedulerGrids = new Bridge.List$1(GridControls.Grid)();
                this._CalendarsLayout = Bridge.Array.init(4, null);
                this._DisplayedItems = new Bridge.Dictionary$2(String,Bridge.Int32)();
                this._LastItemsUpdates = new Bridge.Dictionary$2(String,Date)();
                this._ElementsToMove = new Bridge.Dictionary$2(Bridge.Int32,HTMLElement)();
            }
        },
        constructor: function (options) {
            GridControls._BaseControl.prototype.$constructor.call(this);
    
            this._Options = options;
    
            for (var i = 0; i < this._CalendarsLayout.length; i = (i + 1) | 0) {
                this._CalendarsLayout[i] = new Bridge.List$1(String)();
            }
    
            this._LayoutGridElement = document.createElement('div');
            this._LayoutGridElement.style.width = "100%";
            this._LayoutGridElement.style.height = "100%";
            this._LayoutGridElement.style.overflow = "hidden";
            this._LayoutGridElement.classList.add("scheduler-composite-layout");
    
            if (options.layout.inverseDirection) {
                this._LayoutGridElement.classList.add("scheduler-layout-inverted");
            }
            else  {
                this._LayoutGridElement.classList.add("scheduler-layout-normal");
            }
    
            //  Le layout fait deux lignes, deux colonnes
            var layoutOptions = new GridControls.GridOptions();
            layoutOptions.scrollDisabled = true;
            layoutOptions._AutoLayout = true;
    
            this._LayoutGrid = new GridControls.Grid(null, "scheduler");
            this._LayoutGrid.suspendLayout();
            this.m_SchedulerGrids.add(this._LayoutGrid);
    
            this._LayoutGrid.attach(this._LayoutGridElement);
    
            this._LayoutGrid.addRow({ }, options.layout.columnsHeaderHeight, "px");
            this._LayoutGrid.addRow({ }, 0, "px", 0, 25);
            this._LayoutGrid.addRow({ }, 1, "*");
            this._LayoutGrid.addRow({ }, 0, "px", 0, 25);
    
            this._LayoutGrid.addColumn({ }, options.layout.rowsHeaderWidth, "px");
            this._LayoutGrid.addColumn({ }, 0, "px", 0, 25);
            this._LayoutGrid.addColumn({ }, 1, "*");
            this._LayoutGrid.addColumn({ }, 0, "px", 0, 25);
    
            //--------------
            //  La grille principale se décompose en 4 lignes, 4 colonnes
            //  
            //  La première colonne contient les en-tête, la 2ème les éventuelles colonnes ancrées à gauche, puis les colonnes classiques dans la 3ème et enfin les colonnes ancrées à droite
            //      dans le sens normal (employés en colonne) les ligne 2 et 4 sont inutiles.
            //  Le principe est le même pour les lignes        
            //              A    B    C    D
            //          +-------+-+-------+-+       A1 : zone vide
            //       1  |       | |       | |       A3 : heures
            //          +-------+-+-------+-+       B1 : en-têtes de colonnes ancrées à gauche
            //       2  |       | |       | |       C1 : en-têtes de colonnes flotantes
            //          +-------+-+-------+-+       D1 : en-têtes de colonnes ancrées à droite
            //       3  |       | |       | |       B3 : rendez-vous ancrés à gauche
            //          +-------+-+-------+-+       C3 : rendez-vous flotants
            //       4  |       | |       | |       D3 : rendez-vous ancrés à droite
            //          +-------+-+-------+-+
            var layoutGridsClasses = new Bridge.List$1(String)();
    
            var layoutlayerID = this._LayoutGrid.addLayer(GridControls.Axis.column, null, true);
    
            var layerID;
            for (var x = 0; x < 4; x = (x + 1) | 0) {
                (function () {
                    for (var y = 0; y < 4; y = (y + 1) | 0) {
                        (function () {
                            var cssClass = null;
    
                            var layerAxis = null;
                            if (x === 0 && y === 0) {
                                cssClass = "scheduler-empty-area";
                            }
                            else  {
                                if (y === 0) {
                                    layerAxis = GridControls.Axis.column;
                                    cssClass = "scheduler-columnbeaders-area";
                                }
                                else  {
                                    if (x === 0) {
                                        layerAxis = GridControls.Axis.row;
                                        cssClass = "scheduler-rowheaders-area";
                                    }
                                    else  {
                                        cssClass = "scheduler-appointments-area";
                                    }
                                }
                            }
    
                            if (x === 1 || x === 3 || y === 1 || y === 3) {
                                cssClass += " " + cssClass + "-fixed scheduler-fixed";
                            }
    
                            if (x === 1) {
                                cssClass += "-left";
                            }
                            else  {
                                if (x === 3) {
                                    cssClass += "-right";
                                }
                            }
                            if (y === 1) {
                                cssClass += "-top";
                            }
                            else  {
                                if (y === 3) {
                                    cssClass += "-bottom";
                                }
                            }
    
                            //  l'axe principal n'a aucun intérêt, on mettra une grille dans chaque cellule
    
                            var layoutItem = Bridge.merge(new GridControls._SchedulerLayoutElement(), {
                                x: x,
                                y: y
                            } );
    
                            var itemID = this._LayoutGrid.addItems(layoutlayerID, [layoutItem], function (c) {
                                c.position.axisIndex = x;
                                c.position.start = y;
                                c.position.end = y;
                                c.cssClasses = cssClass.split(String.fromCharCode(32));
                                return true;
                            })[0];
                            layoutItem.container = this._LayoutGrid._Layers.get(layoutlayerID)._GetItemElement(itemID);
    
                            var scrollDisabled = true;
                            if (y > 0 && x > 0) {
                                scrollDisabled = false;
                            }
    
                            //  Pour la zone vide en haut à gauche inutile de créer une grille
                            if (x > 0 || y > 0) {
                                layoutItem.grid = GridControls.Grid.create(Bridge.merge(new GridControls.GridOptions(), {
                                    scrollDisabled: scrollDisabled,
                                    _AutoLayout: true
                                } ), "scheduler part x=" + x.toString() + " y=" + y.toString());
                                //layoutItem.Grid._ViewPortRef = _LayoutGrid._ViewPortElement;
                                layoutItem.grid.suspendLayout();
                                this.m_SchedulerGrids.add(layoutItem.grid);
    
                                if (Bridge.Nullable.hasValue(layerAxis)) {
                                    layerID = layoutItem.grid.addLayer(Bridge.Nullable.getValue(layerAxis), null, true);
                                    layoutItem.layersID.add(layerID);
                                }
    
                                if (scrollDisabled === false) {
                                    this._SetupScrollSync(layoutItem.grid, x, y);
                                }
                                layoutItem.grid.attach(layoutItem.container);
                            }
    
                            this._LayoutElements.add(layoutItem);
                        }).call(this);
                    }
                }).call(this);
            }
    
            this.createHoursRanges();
            this.resumeLayout();
        },
        get_ControlElement: function () {
            return this._LayoutGridElement;
        },
        get_InteractiveSurface: function () {
            return this._LayoutGrid._ViewPortElement;
        },
        get_DateFilter: function () {
            return this._Options.viewDate;
        },
        getNumberOfVisibleDays: function () {
            return this._Options.numberOfVisibleDays;
        },
        setDataSource: function (dataSource) {
            this._DataSource = dataSource;
            dataSource.downloadItems(this._Options.viewDate, new Date(this._Options.viewDate.valueOf() + Math.round((((this._Options.numberOfVisibleDays - 1) | 0)) * 864e5)));
            dataSource._Register(this);
        },
        _SetupScrollSync: function (grid, x, y) {
            grid.scrollChangedCallback = Bridge.fn.bind(this, function (g, ox, oy) {
                if (Bridge.hasValue(this.m_LastTouchedViewPort) && g._ViewPortElement !== this.m_LastTouchedViewPort) {
                    return;
                }
    
                this._SyncScrollers(g, x, y, ox, oy);
            });
        },
        _GetLayoutElement: function (x, y) {
            return this._LayoutElements.getItem(((((x * 4) | 0) + y) | 0));
        },
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
        addGridLinesLayer: function (cssClass) {
            if (cssClass === void 0) { cssClass = null; }
            if (this._GridLinesLayerCreated) {
                return;
            }
    
            this._GridLinesLayerCreated = true;
    
            for (var x = 1; x < 4; x = (x + 1) | 0) {
                for (var y = 1; y < 4; y = (y + 1) | 0) {
                    var li = this._GetLayoutElement(x, y);
                    if (li.horizontalGridLinesLayerID !== -1) {
                        continue;
                    }
    
                    li.horizontalGridLinesLayerID = li.grid.addLayer(GridControls.Axis.row, ["horizontal-grid-lines-layer", cssClass]);
                    li.verticalGridLinesLayerID = li.grid.addLayer(GridControls.Axis.column, ["vertical-grid-lines-layer", cssClass]);
    
                    this._AddGridLines(li.grid, li.horizontalGridLinesLayerID, 0, this._GetLayoutElement(0, y).grid.getNumRows(), this._Options.template.rowsHtmlContent);
                    this._AddGridLines(li.grid, li.verticalGridLinesLayerID, 0, this._GetLayoutElement(x, 0).grid.getNumColumns(), this._Options.template.columnsHtmlContent);
    
                    if (this._Options.layout.inverseDirection) {
                        if (x === 2) {
                            var elem = document.createElement('div');
                            elem.style.position = "absolute";
                            elem.classList.add("current-time-line");
                            this._CurrentTimeElements.add(elem);
                            li.grid._Layers.get(li.verticalGridLinesLayerID).layerElement.appendChild(elem);
                        }
                    }
                    else  {
                        if (y === 2) {
                            var elem1 = document.createElement('div');
                            elem1.style.position = "absolute";
                            elem1.classList.add("current-time-line");
                            this._CurrentTimeElements.add(elem1);
                            li.grid._Layers.get(li.horizontalGridLinesLayerID).layerElement.appendChild(elem1);
                        }
                    }
                }
            }
        },
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
        addItemsLayer: function (name, cssClasses, overlappingEnabled, itemsPaddingStart, itemsPaddingEnd) {
            if (overlappingEnabled === void 0) { overlappingEnabled = false; }
            if (itemsPaddingStart === void 0) { itemsPaddingStart = 0; }
            if (itemsPaddingEnd === void 0) { itemsPaddingEnd = 0; }
            var layerID;
    
            for (var x = 1; x < 4; x = (x + 1) | 0) {
                for (var y = 1; y < 4; y = (y + 1) | 0) {
                    var li = this._GetLayoutElement(x, y);
                    if (li.layersByName.containsKey(name)) {
                        continue;
                    }
    
                    layerID = li.grid.addLayer(this._Options.layout.inverseDirection ? GridControls.Axis.row : GridControls.Axis.column, cssClasses, overlappingEnabled, itemsPaddingStart, itemsPaddingEnd);
                    li.layersID.add(layerID);
                    li.layersByName.add(name, layerID);
                }
            }
        },
        getEmptySpaceElement: function () {
            return this._GetLayoutElement(0, 0).container;
        },
        suspendLayout: function () {
            var $t;
            this._LayoutSuspendCount = (this._LayoutSuspendCount + 1) | 0;
            if (this._LayoutSuspendCount === 1) {
                $t = Bridge.getEnumerator(this.m_SchedulerGrids);
                while ($t.moveNext()) {
                    var g = $t.getCurrent();
                    g.suspendLayout();
                }
            }
        },
        resumeLayout: function () {
            var $t;
            this._LayoutSuspendCount = (this._LayoutSuspendCount - 1) | 0;
            if (this._LayoutSuspendCount === 0 && Bridge.hasValue(this.m_SchedulerGrids)) {
                this.autoFitResources();
    
                this._UpdateVisibleItems();
                $t = Bridge.getEnumerator(this.m_SchedulerGrids);
                while ($t.moveNext()) {
                    var g = $t.getCurrent();
                    g.resumeLayout();
                }
                //Layout();
            }
        },
        layout: function (force) {
            var $t;
            if (force === void 0) { force = false; }
            if (this._LayoutSuspendCount !== 0 && force === false) {
                return;
            }
    
            if (Bridge.hasValue(this.m_SchedulerGrids)) {
                $t = Bridge.getEnumerator(this.m_SchedulerGrids);
                while ($t.moveNext()) {
                    var g = $t.getCurrent();
                    g.layout(force);
                }
    
                this._UpdateCurrentTimeElementEx(false);
            }
        },
        _AddGridLines: function (grid, layerID, offset, count, template, cssClass) {
            if (cssClass === void 0) { cssClass = null; }
            var objects = Bridge.Array.init(count, null);
            this._AddGridLines$1(grid, layerID, offset, objects, template, cssClass);
        },
        _AddGridLines$1: function (grid, layerID, offset, objects, template, cssClass, cssClassSelector) {
            if (cssClass === void 0) { cssClass = null; }
            if (cssClassSelector === void 0) { cssClassSelector = null; }
            if (layerID === -1) {
                return;
            }
    
            var objectsTemp = Bridge.Array.init(objects.length, null);
            for (var i = 0; i < objectsTemp.length; i = (i + 1) | 0) {
                objectsTemp[i] = { item1: i, item2: objects[i] };
            }
    
            grid.addItems(layerID, objectsTemp, function (gc) {
                var idx = (gc.itemData).item1;
                var obj = (gc.itemData).item2;
                idx = (idx + offset) | 0;
                gc.position.axisIndex = idx;
                gc.htmlContent = template;
    
                var cs = new Bridge.List$1(String)();
                if (Bridge.String.isNullOrEmpty(cssClass)) {
                    cs.add("scheduler-grid-line-element");
                }
                else  {
                    cs.add(cssClass);
                }
    
                if (Bridge.hasValue(cssClassSelector)) {
                    var r = cssClassSelector(obj);
                    if (Bridge.String.isNullOrEmpty(r) === false) {
                        cs.add(r);
                    }
                }
    
                gc.cssClasses = cs.toArray();
                return true;
            });
    
            this.layout(true);
        },
        _SyncScrollers: function (grid, sourceX, sourceY, offsetX, offsetY) {
            if (this._SynchingScrollers) {
                return;
            }
    
            this._SynchingScrollers = true;
            if (this._Options.layout.inverseDirection) {
                for (var i = 0; i < 4; i = (i + 1) | 0) {
                    if (sourceX === i && sourceY === 2) {
                        continue;
                    }
                    this._GetLayoutElement(2, i).grid.setHScrollPosition(offsetX);
                }
                if (sourceX !== 0) {
                    this._GetLayoutElement(0, sourceY).grid.setVScrollPosition(offsetY);
                }
            }
            else  {
                for (var i1 = 0; i1 < 4; i1 = (i1 + 1) | 0) {
                    if (sourceY === i1 && sourceX === 2) {
                        continue;
                    }
                    this._GetLayoutElement(i1, 2).grid.setVScrollPosition(offsetY);
                }
                if (sourceY !== 0) {
                    this._GetLayoutElement(sourceX, 0).grid.setHScrollPosition(offsetX);
                }
            }
    
            this._SynchingScrollers = false;
        },
        createHoursRanges: function () {
            var $t;
            var li;
    
            if (this._Options.layout.inverseDirection) {
                li = this._GetLayoutElement(2, 0);
            }
            else  {
                li = this._GetLayoutElement(0, 2);
            }
    
            var hoursGrid = li.grid;
            var hoursLayer = li.getLayerID();
    
            var addRangeHeader;
            var addRangeItems = new Bridge.List$1(Function)();
            var size;
            var sizeUnit;
            var offset;
            var minSize = 0;
            if (this._Options.layout.inverseDirection) {
                offset = hoursGrid.getNumColumns();
                minSize = this._Options.layout.minCellsWidth;
                addRangeHeader = Bridge.fn.bind(hoursGrid, hoursGrid.addColumn);
                addRangeItems.add(Bridge.fn.bind(this._GetLayoutElement(2, 1).grid, this._GetLayoutElement(2, 1).grid.addColumn));
                addRangeItems.add(Bridge.fn.bind(this._GetLayoutElement(2, 2).grid, this._GetLayoutElement(2, 2).grid.addColumn));
                addRangeItems.add(Bridge.fn.bind(this._GetLayoutElement(2, 3).grid, this._GetLayoutElement(2, 3).grid.addColumn));
                hoursGrid.addRow({ header: 1 }, this._Options.layout.columnsHeaderHeight, "px");
                size = this._Options.layout.cellWidth;
                sizeUnit = this._Options.layout.cellWidthUnit;
            }
            else  {
                offset = hoursGrid.getNumRows();
                minSize = this._Options.layout.minRowsHeight;
                addRangeHeader = Bridge.fn.bind(hoursGrid, hoursGrid.addRow);
                addRangeItems.add(Bridge.fn.bind(this._GetLayoutElement(1, 2).grid, this._GetLayoutElement(1, 2).grid.addRow));
                addRangeItems.add(Bridge.fn.bind(this._GetLayoutElement(2, 2).grid, this._GetLayoutElement(2, 2).grid.addRow));
                addRangeItems.add(Bridge.fn.bind(this._GetLayoutElement(3, 2).grid, this._GetLayoutElement(3, 2).grid.addRow));
                hoursGrid.addColumn({ header: 2 }, this._Options.layout.rowsHeaderWidth, "px");
                size = this._Options.layout.cellHeight;
                sizeUnit = this._Options.layout.cellHeightUnit;
            }
    
            //  Déclaration des lignes
            var hoursList = new Bridge.List$1(Bridge.Int32)();
            for (var i = this._Options.firstHour; i <= this._Options.lastHour; i = (i + 1) | 0) {
                addRangeHeader({ hour: i }, size, sizeUnit, minSize, 0);
                hoursList.add(i);
    
                $t = Bridge.getEnumerator(addRangeItems);
                while ($t.moveNext()) {
                    var fct = $t.getCurrent();
                    fct({ hour: i }, size, sizeUnit, minSize, 0);
                }
            }
    
            //  Et on place des éléments sur chaque en-tête de ligne
            this._HoursHeadersCells.clear();
            this._HoursHeadersCells.addRange(hoursGrid.addItems(hoursLayer, Bridge.Linq.Enumerable.from(hoursList).select(function(x) { return Bridge.cast(x, Object); }).toArray(), Bridge.fn.bind(this, $_.GridControls.Scheduler.f1)));
    
            //  Enfin, on rajoute les lignes
            if (this._GridLinesLayerCreated) {
                for (var i1 = 1; i1 < 4; i1 = (i1 + 1) | 0) {
                    var content;
                    var lid;
    
                    if (this._Options.layout.inverseDirection) {
                        li = this._GetLayoutElement(i1, 2);
                        content = this._Options.template.columnsHtmlContent;
                        lid = li.verticalGridLinesLayerID;
                    }
                    else  {
                        li = this._GetLayoutElement(2, i1);
                        content = this._Options.template.rowsHtmlContent;
                        lid = li.horizontalGridLinesLayerID;
                    }
    
                    this._AddGridLines(li.grid, lid, offset, hoursList.getCount(), content, "scheduler-hour-element");
                }
            }
    
            this.layout();
        },
        _RaiseError: function (error, message, data) {
            if (Bridge.hasValue(this._Options.callbacks.onError)) {
                this._Options.callbacks.onError(Bridge.merge(new GridControls.SchedulerErrorEventArgs(), {
                    errorType: error,
                    errorData: data,
                    errorDescription: message
                } ));
            }
        },
        _AddCalendars: function (sourceCalendars, _rangeIndex) {
            var $t, $t1;
            if (!Bridge.hasValue(sourceCalendars) || sourceCalendars.length === 0) {
                return;
            }
    
            //  On crée des calendriers virtuels, décalés par jour
            var tempCalendars = new Bridge.List$1(GridControls._CalendarDataObject)();
            for (var dayIndex = 0; dayIndex < this._Options.numberOfVisibleDays; dayIndex = (dayIndex + 1) | 0) {
                $t = Bridge.getEnumerator(Bridge.Linq.Enumerable.from(sourceCalendars).orderBy($_.GridControls.Scheduler.f2));
                while ($t.moveNext()) {
                    var cdo = $t.getCurrent();
                    var c = cdo.clone();
                    c.iD = c.iD + "@" + dayIndex.toString();
                    c.dayIndex = dayIndex;
                    c.receivedOrder = tempCalendars.getCount();
                    tempCalendars.add(c);
                }
            }
            var calendars = tempCalendars.toArray();
    
            //-----------
    
            var axis = (this._Options.layout.inverseDirection) ? GridControls.Axis.row : GridControls.Axis.column;
    
            var li;
    
            if (this._Options.layout.inverseDirection) {
                li = this._GetLayoutElement(0, _rangeIndex);
            }
            else  {
                li = this._GetLayoutElement(_rangeIndex, 0);
            }
    
            var calendarsGrid = li.grid;
            var calendarsLayer = li.getLayerID();
    
            var offset;
            if (this._Options.layout.inverseDirection) {
                offset = calendarsGrid.getNumRows();
                if (calendarsGrid.getNumColumns() === 0) {
                    calendarsGrid.addColumn({ header: 2 }, this._Options.layout.rowsHeaderWidth, "px");
                }
                calendarsGrid.addRows(calendars, this._Options.layout.cellHeight, this._Options.layout.cellHeightUnit, this._Options.layout.minRowsHeight);
                this._GetLayoutElement(2, _rangeIndex).grid.addRows(calendars, this._Options.layout.cellHeight, this._Options.layout.cellHeightUnit, this._Options.layout.minRowsHeight);
            }
            else  {
                offset = calendarsGrid.getNumColumns();
                if (calendarsGrid.getNumRows() === 0) {
                    calendarsGrid.addRow({ header: 1 }, this._Options.layout.columnsHeaderHeight, "px", 0);
                }
    
                calendarsGrid.addColumns(calendars, this._Options.layout.cellWidth, this._Options.layout.cellWidthUnit, this._Options.layout.minCellsWidth);
                this._GetLayoutElement(_rangeIndex, 2).grid.addColumns(calendars, this._Options.layout.cellWidth, this._Options.layout.cellWidthUnit, this._Options.layout.minCellsWidth);
            }
    
            if (_rangeIndex !== 2) {
                if (this._Options.layout.inverseDirection) {
                    this._LayoutGrid.setRowHeight(_rangeIndex, calendarsGrid.getNumRows() * this._Options.layout.cellHeight, this._Options.layout.cellHeightUnit, this._Options.layout.minRowsHeight);
                }
                else  {
                    this._LayoutGrid.setColumnWidth(_rangeIndex, calendarsGrid.getNumColumns() * this._Options.layout.cellWidth, this._Options.layout.cellWidthUnit, this._Options.layout.minCellsWidth);
                }
            }
    
            $t1 = Bridge.getEnumerator(calendars);
            while ($t1.moveNext()) {
                var o = $t1.getCurrent();
                this._CalendarsLayout[_rangeIndex].add(o.iD);
            }
    
            calendarsGrid.addItems(calendarsLayer, calendars, Bridge.fn.bind(this, function (gc) {
                var data = Bridge.cast(gc.itemData, GridControls._CalendarDataObject);
                var id = data.iD;
    
                gc.position.axisIndex = this._CalendarsLayout[_rangeIndex].indexOf(id);
    
                if (Bridge.hasValue(this._Options.template.calendarsTemplate2)) {
                    gc.htmlContent = this._Options.template.calendarsTemplate2(data.calendarObject, data.dayIndex);
                }
                else  {
                    if (Bridge.hasValue(this._Options.template.calendarsTemplate)) {
                        gc.htmlContent = this._Options.template.calendarsTemplate(data.calendarObject);
                    }
                }
    
                return true;
            }));
    
            //  Enfin, on rajoute les traits
            if (this._GridLinesLayerCreated) {
                for (var i = 1; i < 4; i = (i + 1) | 0) {
                    var content;
                    var lid;
    
                    if (this._Options.layout.inverseDirection) {
                        li = this._GetLayoutElement(i, _rangeIndex);
                        content = this._Options.template.rowsHtmlContent;
                        lid = li.horizontalGridLinesLayerID;
                    }
                    else  {
                        li = this._GetLayoutElement(_rangeIndex, i);
                        content = this._Options.template.columnsHtmlContent;
                        lid = li.verticalGridLinesLayerID;
                    }
    
                    this._AddGridLines$1(li.grid, lid, offset, calendars, content, "scheduler-calendar-element");
                }
            }
    
    
            for (var i1 = 0; i1 < ((this._Options.numberOfVisibleDays - 1) | 0); i1 = (i1 + 1) | 0) {
                this.setCalendarMargins(Bridge.Linq.Enumerable.from(sourceCalendars).last().iD, 0, this._Options.layout.daysSeparationSize, i1, false);
            }
    
            this.layout(true);
        },
        setViewDate: function (date) {
            var $t;
            this._Options.viewDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
            this.suspendLayout();
            for (var x = 1; x < 4; x = (x + 1) | 0) {
                for (var y = 1; y < 4; y = (y + 1) | 0) {
                    var li = this._GetLayoutElement(x, y);
                    $t = Bridge.getEnumerator(li.layersByName.getValues());
                    while ($t.moveNext()) {
                        var layerID = $t.getCurrent();
                        li.grid.removeAllLayerItems(layerID);
                    }
                }
            }
            this._DisplayedItems.clear();
    
            if (Bridge.hasValue(this._DataSource)) {
                this._DataSource.downloadItems(new Date(date.getFullYear(), date.getMonth(), date.getDate()), new Date(new Date(date.getFullYear(), date.getMonth(), date.getDate()).valueOf() + Math.round((((this._Options.numberOfVisibleDays - 1) | 0)) * 864e5)));
            }
    
            //  le resume provoque une mise à jour des éléments de rdv affichés
            //  donc si la journée est déjà chargée, ça les affichera directement
            this.resumeLayout();
    
            if (Bridge.hasValue(this._Options.callbacks.onDateChanged)) {
                this._Options.callbacks.onDateChanged(this, this._Options.viewDate);
            }
        },
        _GetLayoutElementFromItem: function (item, oldRangeIndex) {
            if (oldRangeIndex === void 0) { oldRangeIndex = false; }
            if (this._Options.layout.inverseDirection) {
                return this._GetLayoutElement(2, oldRangeIndex ? Bridge.Nullable.getValue(item._OldRangeIndex) : item._RangeIndex);
            }
            return this._GetLayoutElement(oldRangeIndex ? Bridge.Nullable.getValue(item._OldRangeIndex) : item._RangeIndex, 2);
        },
        _GetLayoutElementLayerFromItem: function (item) {
            var sle = this._GetLayoutElementFromItem(item);
            var layerID;
    
            if (sle.layersByName.containsKey(item.itemLayerName) === false) {
                this.addItemsLayer(item.itemLayerName, null);
            }
    
            layerID = sle.layersByName.get(item.itemLayerName);
            return layerID;
        },
        getItemContainer: function (item) {
            var id = this._DataSource.getItemID(item);
            if (this._DisplayedItems.containsKey(id) === false) {
                return null;
            }
    
            var sitem = this._DataSource._Items.get(id);
            var sle = this._GetLayoutElementFromItem(sitem);
            var layerID = this._GetLayoutElementLayerFromItem(sitem);
    
            return sle.grid._Layers.get(layerID)._GetItemElement(this._DisplayedItems.get(id));
        },
        _UpdateVisibleItems: function () {
            var $t, $t1, $t2, $t3, $t4, $t5;
            if (this._LayoutSuspendCount !== 0 || !Bridge.hasValue(this._DataSource)) {
                return;
            }
    
            var dateTo = new Date(new Date(this._Options.viewDate.getFullYear(), this._Options.viewDate.getMonth(), this._Options.viewDate.getDate()).valueOf() + Math.round((((this._Options.numberOfVisibleDays - 1) | 0)) * 864e5));
            var temp = Bridge.Linq.Enumerable.from(this._DataSource._Items.getValues()).where(Bridge.fn.bind(this, function (i) {
                return Bridge.Date.gte(new Date(i.itemDate.getFullYear(), i.itemDate.getMonth(), i.itemDate.getDate()), new Date(this._Options.viewDate.getFullYear(), this._Options.viewDate.getMonth(), this._Options.viewDate.getDate())) && Bridge.Date.lte(new Date(i.itemDate.getFullYear(), i.itemDate.getMonth(), i.itemDate.getDate()), dateTo);
            }));
            var itemsToDisplay = new Bridge.Collections.HashSet$1(String)("constructor$1", Bridge.Linq.Enumerable.from(temp).select($_.GridControls.Scheduler.f3));
            var updatedLayers = new Bridge.Collections.HashSet$1(Bridge.Int32)("constructor");
    
            //  éléments supprimés
            $t = Bridge.getEnumerator(Bridge.Linq.Enumerable.from(this._DisplayedItems.getKeys()).where(function (i) {
                return itemsToDisplay.contains(i) === false;
            }).toArray());
            while ($t.moveNext()) {
                var itemID = $t.getCurrent();
                var currentItem = this._DataSource._Items.get(itemID);
                this._GetLayoutElementFromItem(currentItem).grid._RemoveItemFromLayers(this._DisplayedItems.get(itemID));
                this._DisplayedItems.remove(itemID);
                this._LastItemsUpdates.remove(itemID);
            }
    
            //---------
            //  éléments ajoutés
            var newItems = new Bridge.Dictionary$2(Bridge.Int32,Bridge.List$1(GridControls._SchedulerItem))();
            $t1 = Bridge.getEnumerator(Bridge.Linq.Enumerable.from(itemsToDisplay).where(Bridge.fn.bind(this, $_.GridControls.Scheduler.f4)));
            while ($t1.moveNext()) {
                var itemID1 = $t1.getCurrent();
                var currentItem1 = this._DataSource._Items.get(itemID1);
                this._LastItemsUpdates.set(itemID1, currentItem1._LastUpdate);
                var layerID = this._GetLayoutElementLayerFromItem(currentItem1);
                if (newItems.containsKey(layerID) === false) {
                    newItems.add(layerID, new Bridge.List$1(GridControls._SchedulerItem)());
                }
                newItems.get(layerID).add(currentItem1);
            }
    
            //--------------------
            //  éléments à mettre à jour : on supprime les anciens et rajoute les nouveaux
            $t2 = Bridge.getEnumerator(Bridge.Linq.Enumerable.from(itemsToDisplay).where(Bridge.fn.bind(this, $_.GridControls.Scheduler.f5)));
            while ($t2.moveNext()) {
                var itemID2 = $t2.getCurrent();
                var currentItem2 = this._DataSource._Items.get(itemID2);
                if (Bridge.equals(this._LastItemsUpdates.get(itemID2), currentItem2._LastUpdate)) {
                    continue;
                }
    
                if (Bridge.Nullable.hasValue(currentItem2._OldRangeIndex) === false) {
                    this._GetLayoutElementFromItem(currentItem2).grid.updateItemPosition(this._GetLayoutElementLayerFromItem(currentItem2), this._DisplayedItems.get(itemID2), currentItem2, Bridge.fn.bind(this, this._SetItemPosition));
                }
                else  {
                    //  On a changé de grille, il faut supprimenr l'élément et le re-créer
    
                    //  Suppression de l'ancien élément
                    var oldElement = this._GetLayoutElementFromItem(currentItem2, true).grid._RemoveItemFromLayers(this._DisplayedItems.get(itemID2));
                    this._ElementsToMove.add(currentItem2._InternalID, oldElement);
                    this._DisplayedItems.remove(itemID2);
    
                    //  Et rajout
                    var layerID1 = this._GetLayoutElementLayerFromItem(currentItem2);
                    if (newItems.containsKey(layerID1) === false) {
                        newItems.add(layerID1, new Bridge.List$1(GridControls._SchedulerItem)());
                    }
                    newItems.get(layerID1).add(currentItem2);
                }
                this._LastItemsUpdates.set(itemID2, currentItem2._LastUpdate);
            }
    
            var layoutItemsByLayer = new Bridge.Dictionary$2(Bridge.Int32,GridControls._SchedulerLayoutElement)();
            $t3 = Bridge.getEnumerator(this._LayoutElements);
            while ($t3.moveNext()) {
                var x = $t3.getCurrent();
                $t4 = Bridge.getEnumerator(x.layersByName.getValues());
                while ($t4.moveNext()) {
                    var lid = $t4.getCurrent();
                    layoutItemsByLayer.add(lid, x);
                }
            }
    
            $t5 = Bridge.getEnumerator(newItems.getKeys());
            while ($t5.moveNext()) {
                var layerID2 = $t5.getCurrent();
                var ids = layoutItemsByLayer.get(layerID2).grid.addItems(layerID2, newItems.get(layerID2).toArray(), Bridge.fn.bind(this, this._SetItemPosition));
                for (var i = 0; i < ids.length; i = (i + 1) | 0) {
                    this._DisplayedItems.set(newItems.get(layerID2).getItem(i).itemID, ids[i]);
                }
            }
            this._ElementsToMove.clear();
        },
        _SetItemPosition: function (gc) {
            var sc = Bridge.cast(gc.itemData, GridControls._SchedulerItem);
    
            /* 
                if (_DataSource._Calendars.ContainsKey(sc.CalendarID) == false)
                {
                    sc._LastUpdate = DateTime.Now;
                    return false;
                }
                */
    
            var setContent = true;
            if (this._ElementsToMove.containsKey(sc._InternalID)) {
                gc._Element = this._ElementsToMove.get(sc._InternalID);
                this._ElementsToMove.remove(sc._InternalID);
                setContent = false;
            }
    
            var days = Bridge.Int.clip32(Bridge.Date.subdd(new Date(sc.itemDate.getFullYear(), sc.itemDate.getMonth(), sc.itemDate.getDate()), this._Options.viewDate).getTotalDays());
            gc.position.axisIndex = this._CalendarsLayout[sc._RangeIndex].indexOf(sc.calendarID + "@" + days.toString());
    
            gc.position.start = Bridge.Int.clip32(sc.itemDate.getHours() - this._Options.firstHour);
            gc.position.itemStartOffset = sc.itemDate.getMinutes() * 100.0 / 60.0;
    
            var dateEnd = new Date(sc.itemDate.valueOf() + Math.round((sc.duration) * 6e4));
            gc.position.end = Bridge.Int.clip32(dateEnd.getHours() - this._Options.firstHour);
            gc.position.itemEndOffset = dateEnd.getMinutes() * 100.0 / 60.0;
    
            if (gc.position.itemEndOffset === 0) {
                gc.position.itemEndOffset = 100;
                gc.position.end = Bridge.Int.clip32(Bridge.Nullable.sub(gc.position.end, 1));
            }
    
            gc.cssClasses = sc.cssClasses;
    
            if (setContent && Bridge.hasValue(this._Options.callbacks.getItemHtmlTemplate)) {
                gc.htmlContent = this._Options.callbacks.getItemHtmlTemplate(this, sc.itemLayerName, sc.itemObject);
            }
    
            return true;
        },
        destroy: function () {
            var $t;
            if (!Bridge.hasValue(this._LayoutGridElement)) {
                return;
            }
    
            if (Bridge.hasValue(this._DataSource)) {
                this._DataSource._Unregister(this);
            }
    
            $t = Bridge.getEnumerator(Bridge.Linq.Enumerable.from(this.m_SchedulerGrids).reverse());
            while ($t.moveNext()) {
                var grid = $t.getCurrent();
                grid.destroy();
            }
    
            if (Bridge.Nullable.hasValue(this._CurrentTimeTimer)) {
                window.clearTimeout(Bridge.Nullable.getValue(this._CurrentTimeTimer));
                this._CurrentTimeTimer = null;
            }
    
            if (Bridge.hasValue(this._currentMouseAction)) {
                this._currentMouseAction._Dispose();
                this._currentMouseAction = null;
            }
    
            GridControls._BaseControl.prototype.destroy.call(this);
    
            this._LayoutGridElement = null;
            this.m_SchedulerGrids = null;
            this._LayoutGrid = null;
            this._CalendarsLayout = null;
            this._DisplayedItems = null;
            this._Options = null;
            this._DataSource = null;
            this._HoursHeadersCells = null;
            this._CurrentTimeElements = null;
            this._LayoutElements = null;
            this._LastItemsUpdates = null;
            this.m_LastTouchedViewPort = null;
        },
        attach: function (host) {
            GridControls._BaseControl.prototype.attach.call(this, host);
    
            // le layout ne sera fait qu'une fois qu'on aura rendu la main au navigateur
            window.setTimeout(Bridge.fn.bind(this, $_.GridControls.Scheduler.f6), 1);
    
            if (Bridge.Nullable.hasValue(this._CurrentTimeTimer)) {
                window.clearTimeout(Bridge.Nullable.getValue(this._CurrentTimeTimer));
            }
    
            this._CurrentTimeTimer = window.setTimeout(Bridge.fn.bind(this, this._UpdateCurrentTimeElement), 1);
            $(this._HostElement).data("iwc-scheduler-class", this).addClass("iwc-scheduler-control");
    
            this._BindEvents();
        },
        detach: function () {
            this.m_LastTouchedViewPort = null;
    
            if (!Bridge.hasValue(this._HostElement)) {
                return;
            }
    
            if (Bridge.Nullable.hasValue(this._CurrentTimeTimer)) {
                window.clearTimeout(Bridge.Nullable.getValue(this._CurrentTimeTimer));
                this._CurrentTimeTimer = null;
            }
    
            $(this._HostElement).data("iwc-scheduler-class", null).removeClass("iwc-scheduler-control");
            this._UnbindEvents();
    
            GridControls._BaseControl.prototype.detach.call(this);
        },
        _UpdateCurrentTimeElement: function () {
            if (!Bridge.hasValue(this._Options)) {
                return;
            }
    
            this._UpdateCurrentTimeElementEx();
        },
        _UpdateCurrentTimeElementEx: function (setTimeout) {
            var $t, $t1, $t2;
            if (setTimeout === void 0) { setTimeout = true; }
            var now = new Date();
    
            if (!Bridge.hasValue(this._Options)) {
                return;
            }
    
            if (this._GridLinesLayerCreated === false) {
                if (setTimeout) {
                    this._CurrentTimeTimer = window.setTimeout(Bridge.fn.bind(this, this._UpdateCurrentTimeElement), (((((((60 - now.getSeconds()) | 0) + 1) | 0)) * 1000) | 0));
                }
                return;
            }
    
            if (this.m_UpdateCurrentTimeDisabled) {
                this.m_UpdateCurrentTimeRequested = true;
                if (setTimeout) {
                    this._CurrentTimeTimer = window.setTimeout(Bridge.fn.bind(this, this._UpdateCurrentTimeElement), (((((((60 - now.getSeconds()) | 0) + 1) | 0)) * 1000) | 0));
                }
                return;
            }
    
            var hour = (now.getHours() - this._Options.firstHour) | 0;
            if (hour < 0 || hour >= this._HoursHeadersCells.getCount()) {
                $t = Bridge.getEnumerator(this._CurrentTimeElements);
                while ($t.moveNext()) {
                    var element = $t.getCurrent();
                    element.style.opacity = "0";
                }
            }
            else  {
                var li;
    
                var scrollPosition = (this._Options.layout.inverseDirection) ? this._GetLayoutElement(2, 2).grid._ViewPortElement.scrollLeft : this._GetLayoutElement(2, 2).grid._ViewPortElement.scrollTop;
    
                var offset;
                if (this._Options.layout.inverseDirection) {
                    li = this._GetLayoutElement(2, 0);
                    offset = li.grid._Columns.getItem(hour).computedOffset;
                    offset += (Bridge.Int.div(((li.grid._Columns.getItem(hour).computedSize * now.getMinutes()) | 0), 60)) | 0;
                    offset = offset - 1;
    
                    $t1 = Bridge.getEnumerator(this._CurrentTimeElements);
                    while ($t1.moveNext()) {
                        var element1 = $t1.getCurrent();
                        element1.style.top = "0";
                        element1.style.left = offset + "px";
                        element1.style.bottom = "0";
                        element1.style.width = "3px";
                        element1.style.opacity = "1";
                    }
                }
                else  {
                    li = this._GetLayoutElement(0, 2);
                    offset = li.grid._Rows.getItem(hour).computedOffset;
                    offset += (Bridge.Int.div(((li.grid._Rows.getItem(hour).computedSize * now.getMinutes()) | 0), 60)) | 0;
                    offset = offset - 1;
    
                    $t2 = Bridge.getEnumerator(this._CurrentTimeElements);
                    while ($t2.moveNext()) {
                        var element2 = $t2.getCurrent();
                        element2.style.top = offset + "px";
                        element2.style.left = "0";
                        element2.style.height = "3px";
                        element2.style.right = "0";
                        element2.style.opacity = "1";
                    }
                }
            }
    
            if (Bridge.hasValue(this._Options.callbacks.onTimeChanged)) {
                var timeStr = Bridge.Date.format(now, Bridge.CultureInfo.getCurrentCulture().dateTimeFormat.shortTimePattern);
                this._Options.callbacks.onTimeChanged(this, timeStr);
            }
    
            if (setTimeout) {
                this._CurrentTimeTimer = window.setTimeout(Bridge.fn.bind(this, this._UpdateCurrentTimeElement), (((((((60 - now.getSeconds()) | 0) + 1) | 0)) * 1000) | 0));
            }
        },
        _FindItemFromElement: function (e) {
            if (!Bridge.hasValue(e) || !Bridge.hasValue(this._DataSource)) {
                return null;
            }
    
            var sid = e.dataset.gridelementid;
            var id = { };
            if (Bridge.String.isNullOrEmpty(sid) || Bridge.Int.tryParseInt(sid, id, -2147483648, 2147483647) === false) {
                return null;
            }
    
            var itemID = Bridge.Linq.Enumerable.from(this._DisplayedItems).where(function (d) {
                return d.value === id.v;
            }).select($_.GridControls.Scheduler.f7).firstOrDefault(null, null);
            if (this._DataSource._Items.containsKey(itemID)) {
                return this._DataSource._Items.get(itemID);
            }
    
            return null;
        },
        _BindEvents: function () {
            $(this._LayoutGridElement).on("touchstart", Bridge.fn.bind(this, $_.GridControls.Scheduler.f8));
    
            $(this._LayoutGridElement).on("touchend touchcancel", Bridge.fn.bind(this, $_.GridControls.Scheduler.f9));
    
            //-----------------------   INTERRACTIONS UTILISATEUR
            //jQuery.Select(_LayoutGridElement).On("click", new Func<jQueryMouseEvent, bool>(_OnClick));
    
            $(this.get_InteractiveSurface()).on("mousedown touchstart", Bridge.fn.bind(this, this._BeginMoveResizeItem));
            $(this.get_InteractiveSurface()).on("mousemove mouseup mouseleave touchmove touchend touchcancel", "", Bridge.fn.bind(this, this._MoveResizeItem));
        },
        _CompleteMouseEvent: function (evt) {
            if (Bridge.String.startsWith(evt.type, "touch")) {
                var e = evt;
                if (Bridge.hasValue(e.touches) && e.touches.length > 0) {
                    e.clientX = e.touches[0].clientX;
                    e.clientY = e.touches[0].clientY;
                }
                else  {
                    if (Bridge.hasValue(e.originalEvent) && Bridge.hasValue(e.originalEvent.touches) && e.originalEvent.touches.length > 0) {
                        e.clientX = e.originalEvent.touches[0].clientX;
                        e.clientY = e.originalEvent.touches[0].clientY;
                    }
                }
            }
        },
        _BeginMoveResizeItem: function (evt) {
            var $t;
            if (Bridge.hasValue(this._currentMouseAction) || this._WaitForMouseDown === false) {
                return true;
            }
    
            if (Bridge.String.startsWith(evt.type, "touch")) {
                this._AllowMouseEvents = false;
            }
            else  {
                if (this._AllowMouseEvents === false) {
                    return true;
                }
            }
    
            this._CompleteMouseEvent(evt);
    
            $t = Bridge.getEnumerator(this._GetHOverHtmlELements(this.get_InteractiveSurface(), evt.clientX, evt.clientY));
            while ($t.moveNext()) {
                (function () {
                    var hover = $t.getCurrent();
                    if (hover.classList.contains("scheduler-move-item")) {
                        if (Bridge.hasValue(this._Options.callbacks.prepareMoveItems)) {
                            var testElement = hover;
                            var item = null;
                            while (Bridge.hasValue(testElement) && !Bridge.hasValue(item)) {
                                item = this._FindItemFromElement(testElement);
                                testElement = testElement.parentElement;
                            }
    
                            if (Bridge.hasValue(item)) {
                                var moveEventArgs = new GridControls.SchedulerMoveItemsEventArgs();
                                moveEventArgs.item = item.itemObject;
                                moveEventArgs.moveElement = evt.target;
                                moveEventArgs.scheduler = this;
    
                                this._Options.callbacks.prepareMoveItems(moveEventArgs);
                                if (moveEventArgs.cancel === false && Bridge.hasValue(moveEventArgs.itemsToMove) && moveEventArgs.itemsToMove.length > 0) {
                                    var temp = new Bridge.List$1(Object)();
                                    temp.add(item.itemObject);
                                    temp.addRange(Bridge.Linq.Enumerable.from(moveEventArgs.itemsToMove).where(function (o) {
                                        return o !== item.itemObject;
                                    }));
                                    moveEventArgs.itemsToMove = temp.toArray();
                                    this._currentMouseAction = GridControls._SchedulerMouseAction._Create(GridControls._SchedulerMoveItem, this, moveEventArgs.itemsToMove, evt, moveEventArgs);
                                }
                            }
                        }
                    }
                    else  {
                        if (hover.classList.contains("scheduler-resize-item")) {
                            var resizeEventArgs = new GridControls.SchedulerResizeItemEventArgs();
                            resizeEventArgs.item = Bridge.Linq.Enumerable.from(this._GetHOverItems(evt)).firstOrDefault(null, null);
                            resizeEventArgs.resizeElement = evt.target;
                            resizeEventArgs.scheduler = this;
    
                            if (Bridge.hasValue(resizeEventArgs.item)) {
                                if (Bridge.hasValue(this._Options.callbacks.prepareResizeItem)) {
                                    this._Options.callbacks.prepareResizeItem(resizeEventArgs);
                                }
                            }
    
                            if (resizeEventArgs.cancel === false && Bridge.hasValue(resizeEventArgs.item)) {
                                this._currentMouseAction = GridControls._SchedulerMouseAction._Create(GridControls._SchedulerResizeItem, this, [resizeEventArgs.item], evt, resizeEventArgs);
                            }
                        }
                    }
                }).call(this);
            }
    
            if (!Bridge.hasValue(this._currentMouseAction)) {
                this._WaitForMouseDown = false;
                this._OnClick(evt);
            }
    
            if (Bridge.hasValue(this._currentMouseAction)) {
                evt.stopPropagation();
                evt.preventDefault();
    
                if (Bridge.is(this._currentMouseAction, GridControls._SchedulerMoveItem)) {
                    this.get_InteractiveSurface().style.cursor = "move";
                }
    
                return false;
            }
    
            return true;
        },
        _GetResizeCursor: function () {
            if (this._Options.layout.inverseDirection) {
                return "ew-resize";
            }
            return "ns-resize";
        },
        _SetCurrentCursor: function (evt) {
            var $t;
            var cursor = "default";
    
            $t = Bridge.getEnumerator(this._GetHOverHtmlELements(this.get_InteractiveSurface(), evt.clientX, evt.clientY));
            while ($t.moveNext()) {
                var hover = $t.getCurrent();
                if (hover === this.get_InteractiveSurface()) {
                    break;
                }
    
                if (hover.classList.contains("scheduler-move-item")) {
                    cursor = "move";
                    break;
                }
                if (hover.classList.contains("scheduler-resize-item")) {
                    cursor = this._GetResizeCursor();
                    break;
                }
                if (cursor === "default" && hover.style.cursor !== "default" && Bridge.String.isNullOrEmpty(hover.style.cursor) === false) {
                    cursor = hover.style.cursor;
                }
            }
    
            this.get_InteractiveSurface().style.cursor = cursor;
        },
        _MoveResizeItem: function (evt) {
            if (!Bridge.hasValue(this._currentMouseAction)) {
                this._SetCurrentCursor(evt);
    
                if (this._WaitForMouseDown === false) {
                    if (evt.type === "touchcancel" || evt.type === "touchend" || evt.type === "mouseup" || evt.type === "mouseleave") {
                        this._WaitForMouseDown = true;
                    }
                }
                return true;
            }
    
            if (Bridge.String.startsWith(evt.type, "touch") === false && this._AllowMouseEvents === false) {
                return true;
            }
    
            this._CompleteMouseEvent(evt);
    
            //  La souris est sortie du contrôle. Si on est en déplacement de RDV et que la sours va sur un autre scheduler, on lui transfère l'action
            if (evt.type === "mouseleave" && Bridge.is(this._currentMouseAction, GridControls._SchedulerMoveItem)) {
                var smi = Bridge.cast(this._currentMouseAction, GridControls._SchedulerMoveItem);
                var mouseOverScheduler = null;
                $(".iwc-scheduler-control").each(Bridge.fn.bind(this, function (i, e) {
                    if (Bridge.hasValue(mouseOverScheduler)) {
                        return;
                    }
    
                    if (this._IsPointInElementRect(e, evt.clientX, evt.clientY)) {
                        var tempScheduler = Bridge.as($(e).data("iwc-scheduler-class"), GridControls.Scheduler);
    
                        //  On a trouvé un scheduler, on l'accepte comme nouveau gestionnaire seulement s'il partage la même source de données
                        if (tempScheduler !== this && Bridge.hasValue(tempScheduler) && tempScheduler._DataSource === this._DataSource) {
                            mouseOverScheduler = tempScheduler;
                        }
                    }
                }));
    
                //  déplacement du "focus" sur l'autre scheduler
                if (Bridge.hasValue(mouseOverScheduler)) {
                    //  Sauf s'il est sur une date différent et qu'on interdit le déplacement de date à date
                    if (smi._actionData.allowDateChange || (Bridge.Date.gte(new Date(this.get_DateFilter().getFullYear(), this.get_DateFilter().getMonth(), this.get_DateFilter().getDate()), new Date(mouseOverScheduler.get_DateFilter().getFullYear(), mouseOverScheduler.get_DateFilter().getMonth(), mouseOverScheduler.get_DateFilter().getDate())) && Bridge.Date.lt(new Date(this.get_DateFilter().getFullYear(), this.get_DateFilter().getMonth(), this.get_DateFilter().getDate()), new Date(new Date(mouseOverScheduler.get_DateFilter().getFullYear(), mouseOverScheduler.get_DateFilter().getMonth(), mouseOverScheduler.get_DateFilter().getDate()).valueOf() + Math.round((mouseOverScheduler._Options.numberOfVisibleDays) * 864e5))))) {
                        this._currentMouseAction._CurrentScheduler = mouseOverScheduler;
                        mouseOverScheduler._currentMouseAction = this._currentMouseAction;
                        mouseOverScheduler._ClickDisabled = true;
                        this._ClickDisabled = false;
    
                        var de = evt;
                        de.type = "mousemove";
                        mouseOverScheduler._MoveResizeItem(evt);
    
                        return true;
                    }
                }
            }
    
            evt.stopPropagation();
            evt.preventDefault();
            this._currentMouseAction = this._currentMouseAction._OnMouseEvent(evt);
            if (!Bridge.hasValue(this._currentMouseAction)) {
                this._SetCurrentCursor(evt);
                this._ClickDisabled = true;
                window.setTimeout(Bridge.fn.bind(this, $_.GridControls.Scheduler.f10), 50);
            }
            return false;
        },
        _UnbindEvents: function () {
            if (Bridge.Nullable.hasValue(this._DoubleClickTimer)) {
                //  double-clic
                window.clearTimeout(Bridge.Nullable.getValue(this._DoubleClickTimer));
            }
    
            $(this._LayoutGridElement).off();
            $(this.get_InteractiveSurface()).off();
        },
        _RaiseMouseClickEvent: function (evt, callback, clickedHtmlElements) {
            if (Bridge.hasValue(callback)) {
                var arg = this._MakeSchedulerMouseEventArgs(evt, clickedHtmlElements);
                callback(arg);
            }
        },
        _OnClick: function (e) {
            var $t, $t1;
            if (this._ClickDisabled) {
                return true;
            }
    
            //e.PreventDefault();
            //e.StopPropagation();
    
            if (Bridge.hasValue(this._currentMouseAction)) {
                return false;
            }
    
            var cancel = false;
            var clickedHtmlElements = null;
    
            if (cancel === false && Bridge.String.isNullOrEmpty(this._Options.mouseEvents.nonClickableCssClasses) === false) {
                var cssClasses = this._Options.mouseEvents.nonClickableCssClasses.split(String.fromCharCode(32));
                clickedHtmlElements = this._GetHOverHtmlELements(e.target, e.clientX, e.clientY);
                $t = Bridge.getEnumerator(clickedHtmlElements);
                while ($t.moveNext()) {
                    var element = $t.getCurrent();
                    $t1 = Bridge.getEnumerator(cssClasses);
                    while ($t1.moveNext()) {
                        var cc = $t1.getCurrent();
                        if (element.classList.contains(cc)) {
                            cancel = true;
                            break;
                        }
                    }
                }
            }
    
            if (cancel) {
                if (Bridge.Nullable.hasValue(this._DoubleClickTimer)) {
                    //  double-clic
                    window.clearTimeout(Bridge.Nullable.getValue(this._DoubleClickTimer));
                    this._DoubleClickTimer = null;
                }
    
                return false;
            }
    
            if (Bridge.Nullable.hasValue(this._DoubleClickTimer)) {
                if (Math.abs(((e.clientX - this._LastCLickX) | 0)) <= this._Options.mouseEvents.doubleClicDistance && Math.abs(((e.clientY - this._LastCLickY) | 0)) <= this._Options.mouseEvents.doubleClicDistance) {
                    //  double-clic
                    window.clearTimeout(Bridge.Nullable.getValue(this._DoubleClickTimer));
                    this._DoubleClickTimer = null;
    
                    this._RaiseMouseClickEvent(e, this._Options.callbacks.onDoubleClick, clickedHtmlElements);
                    return false;
                }
            }
    
            this._LastCLickX = e.clientX;
            this._LastCLickY = e.clientY;
            this._RaiseMouseClickEvent(e, this._Options.callbacks.onClick, clickedHtmlElements);
    
            this._DoubleClickTimer = window.setTimeout(Bridge.fn.bind(this, $_.GridControls.Scheduler.f11), this._Options.mouseEvents.doubleClickDelay);
    
            return false;
        },
        _GetHOverItem: function () {
            var list = document.querySelectorAll(":hover");
            for (var i = (list.length - 1) | 0; i >= 0; i = (i - 1) | 0) {
                var item = this._FindItemFromElement(list[i]);
                if (Bridge.hasValue(item)) {
                    return item;
                }
            }
    
            return null;
        },
        _GetHOverItems: function (evt) {
            var items = new Bridge.List$1(Object)();
            var list = this._GetHOverGridItems(evt.clientX, evt.clientY);
            for (var i = (list.getCount() - 1) | 0; i >= 0; i = (i - 1) | 0) {
                var item = this._FindItemFromElement(list.getItem(i));
                if (Bridge.hasValue(item)) {
                    items.add(item.itemObject);
                }
            }
            return items.toArray();
        },
        _GetSchedulerPositionFromClientCoordinates: function (clientX, clientY, calendarID, hour, minute, dayIndex) {
            var $t;
            var hourSet = false;
    
            dayIndex.v = 0;
    
            //  D'abord les rangées épinglées
            var layoutElementsIndices = [1, 3, 2];
    
            calendarID.v = null;
    
            //  On cherche la correspondance par rapport aux headers
            //  Colonnes (axis=0) puis lignes (axis=1)
            for (var axis = 0; axis < 2; axis = (axis + 1) | 0) {
                var mousePosition = axis === 0 ? clientX : clientY;
    
                for (var ri = 0; ri < layoutElementsIndices.length; ri = (ri + 1) | 0) {
                    var rangeIndex = layoutElementsIndices[ri];
                    var li = (axis === 0 ? this._GetLayoutElement(rangeIndex, 0) : this._GetLayoutElement(0, rangeIndex));
    
                    var r = li.grid._ViewPortElement.getBoundingClientRect();
                    var index = 0;
                    var ranges = axis === 0 ? li.grid._Columns : li.grid._Rows;
                    var found = false;
                    $t = Bridge.getEnumerator(ranges);
                    while ($t.moveNext()) {
                        var range = $t.getCurrent();
                        var offset;
    
                        if (axis === 0) {
                            offset = (((range.computedOffset - li.grid._ViewPortElement.scrollLeft) | 0) + Bridge.Int.clip32(r.left)) | 0;
                        }
                        else  {
                            offset = (((range.computedOffset - li.grid._ViewPortElement.scrollTop) | 0) + Bridge.Int.clip32(r.top)) | 0;
                        }
    
                        if (mousePosition >= offset && mousePosition < ((offset + range.computedSize) | 0)) {
                            if ((axis === 0 && this._Options.layout.inverseDirection) || (axis === 1 && !this._Options.layout.inverseDirection)) {
                                hour.v = (this._Options.firstHour + index) | 0;
                                minute.v = (Bridge.Int.div((((((mousePosition - offset) | 0)) * 60) | 0), range.computedSize)) | 0;
                                hourSet = true;
                            }
                            else  {
                                if (index < this._CalendarsLayout[rangeIndex].getCount()) {
                                    var parts = this._CalendarsLayout[rangeIndex].getItem(index).split(String.fromCharCode(64));
                                    calendarID.v = parts[0];
                                    dayIndex.v = Bridge.Int.parseInt(parts[1], -2147483648, 2147483647);
                                }
                            }
    
                            found = true;
                            break;
                        }
    
                        index = (index + 1) | 0;
                    }
    
                    //  on a trouvé, inutile de vérifier les autres layouts
                    if (found) {
                        break;
                    }
                }
            }
    
            return hourSet && Bridge.hasValue(calendarID.v);
        },
        _MakeSchedulerMouseEventArgs: function (evt, clickedHtmlElements) {
            var me = new GridControls.SchedulerMouseEventArgs();
            me.scheduler = this;
            me.originalEvent = evt;
    
            if (!Bridge.hasValue(clickedHtmlElements)) {
                clickedHtmlElements = this._GetHOverHtmlELements(evt.target, evt.clientX, evt.clientY);
            }
            me.elements = clickedHtmlElements.toArray();
    
            var calendarID = { v : null };
            var hour = { v : -1 };
            var minute = { v : -1 };
            var dayIndex = { v : 0 };
            this._GetSchedulerPositionFromClientCoordinates(evt.clientX, evt.clientY, calendarID, hour, minute, dayIndex);
            me.calendarID = calendarID.v;
            me.hour = hour.v;
            me.minute = minute.v;
    
            var items = new Bridge.List$1(Object)();
            var list = this._GetHOverGridItems(evt.clientX, evt.clientY);
            for (var i = (list.getCount() - 1) | 0; i >= 0; i = (i - 1) | 0) {
                var item = this._FindItemFromElement(list.getItem(i));
                if (Bridge.hasValue(item)) {
                    items.add(item.itemObject);
                }
            }
            me.items = items.toArray();
            return me;
        },
        _IsPointInElementRect: function (element, viewportX, viewportY) {
            var $t;
            var style;
            style = ($t = element.currentStyle, Bridge.hasValue($t) ? $t : window.getComputedStyle(element));
    
            if (style.opacity === "0" || style.display === "none") {
                return false;
            }
    
            var rect = element.getBoundingClientRect();
            return viewportX >= rect.left && viewportX <= rect.right && viewportY >= rect.top && viewportY <= rect.bottom;
        },
        _GetHOverGridItems: function (viewportX, viewportY) {
            var $t, $t1, $t2;
            var elements = new Bridge.List$1(HTMLElement)();
    
            $t = Bridge.getEnumerator(this._LayoutElements);
            while ($t.moveNext()) {
                var li = $t.getCurrent();
                if (!Bridge.hasValue(li.grid)) {
                    continue;
                }
    
                if (this._IsPointInElementRect(li.grid._ViewPortElement, viewportX, viewportY) === false) {
                    continue;
                }
    
                $t1 = Bridge.getEnumerator(Bridge.Linq.Enumerable.from(li.grid._Layers.getValues()).select($_.GridControls.Scheduler.f12));
                while ($t1.moveNext()) {
                    var layer = $t1.getCurrent();
                    $t2 = Bridge.getEnumerator(layer.children);
                    while ($t2.moveNext()) {
                        var layerElement = $t2.getCurrent();
                        if (this._IsPointInElementRect(layerElement, viewportX, viewportY)) {
                            elements.add(layerElement);
                        }
                    }
                }
            }
    
    
            return elements;
        },
        _GetHOverHtmlELements: function (root, viewportX, viewportY) {
            var elements = new Bridge.List$1(HTMLElement)();
    
            var idx = 0;
            var tree = new Bridge.List$1(HTMLElement)();
            tree.add(root);
            while (idx < tree.getCount()) {
                var current = tree.getItem(idx);
                if (this._IsPointInElementRect(current, viewportX, viewportY)) {
                    elements.insert(0, current);
                    tree.addRange(current.children);
                }
    
                idx = (idx + 1) | 0;
            }
    
    
            return elements;
        },
        _OnCalendarsAdded: function (calendars) {
            this._AddCalendars(Bridge.Linq.Enumerable.from(calendars).where($_.GridControls.Scheduler.f13).toArray(), 1);
            this._AddCalendars(Bridge.Linq.Enumerable.from(calendars).where($_.GridControls.Scheduler.f14).toArray(), 2);
            this._AddCalendars(Bridge.Linq.Enumerable.from(calendars).where($_.GridControls.Scheduler.f15).toArray(), 3);
        },
        _IncrementAjaxRequestCount: function (step) {
            this._RunningAjaxRequests = (this._RunningAjaxRequests + step) | 0;
            if (Bridge.hasValue(this._Options.callbacks.onAjaxRequest)) {
                this._Options.callbacks.onAjaxRequest(this, this._RunningAjaxRequests !== 0);
            }
        },
        _OnItemsChanged: function (added, updated, removed) {
            this._UpdateVisibleItems();
        },
        _ShowHideResource: function (layoutIndex, resourceIndex, hidden) {
            var axis = this._Options.layout.inverseDirection ? 1 : 0;
            var indices = [0, 2];
            for (var i = 0; i < 2; i = (i + 1) | 0) {
                var li = (axis === 0 ? this._GetLayoutElement(layoutIndex, indices[i]) : this._GetLayoutElement(indices[i], layoutIndex));
                var ranges = axis === 0 ? li.grid._Columns : li.grid._Rows;
                ranges.getItem(resourceIndex).hidden = hidden;
            }
        },
        autoFitResources: function () {
            /* 
                if (_Options.Layout.AutoFit == false)
                    return;
    
                var clientWidth = jQuery.Select(_ControlElement).Width();
                if (clientWidth == 0)
                    return;
    
                int calendarsAxis = _Options.Layout.InverseDirection ? 1 : 0;
                Dictionary<int, _GridRange> visibleRanges = new Dictionary<int, _GridRange>();
                for (int layoutIndex = 1; layoutIndex <= 3; layoutIndex++)
                {
                    _SchedulerLayoutElement li = (calendarsAxis == 0 ? _GetLayoutElement(layoutIndex, 0) : _GetLayoutElement(0, layoutIndex));
                    IEnumerable<_GridRange> ranges = calendarsAxis == 0 ? li.Grid._Columns : li.Grid._Rows;
                    int index = 0;
                    foreach (_GridRange range in ranges)
                    {
                        if (range.Hidden == false)
                            visibleRanges.Add(index, range);
                        index++;
                    }
                }
    
                if (clientWidth / visibleRanges.Count < 200)
                {
                }*/
        },
        _SetResourceMargins: function (layoutIndex, resourceIndex, start, end) {
            var axis = this._Options.layout.inverseDirection ? 1 : 0;
            var indices = [0, 2];
            for (var i = 0; i < 2; i = (i + 1) | 0) {
                var li = (axis === 0 ? this._GetLayoutElement(layoutIndex, indices[i]) : this._GetLayoutElement(indices[i], layoutIndex));
                var ranges = axis === 0 ? li.grid._Columns : li.grid._Rows;
                ranges.getItem(resourceIndex).marginStart = start;
                ranges.getItem(resourceIndex).marginEnd = end;
            }
        },
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
        setCalendarMargins: function (calendarID, marginStart, marginEnd, dayOffset, autoLayout) {
            var $t;
            if (dayOffset === void 0) { dayOffset = 0; }
            if (autoLayout === void 0) { autoLayout = true; }
            var calendarsAxis = this._Options.layout.inverseDirection ? 1 : 0;
    
            calendarID = calendarID + "@" + dayOffset.toString();
            for (var layoutIndex = 1; layoutIndex <= 3; layoutIndex = (layoutIndex + 1) | 0) {
                var li = (calendarsAxis === 0 ? this._GetLayoutElement(layoutIndex, 0) : this._GetLayoutElement(0, layoutIndex));
                var ranges = calendarsAxis === 0 ? li.grid._Columns : li.grid._Rows;
                var index = 0;
                $t = Bridge.getEnumerator(ranges);
                while ($t.moveNext()) {
                    var range = $t.getCurrent();
                    var cID = this._CalendarsLayout[layoutIndex].getItem(index);
    
                    if (Bridge.String.equals(cID, calendarID, 3)) {
                        this._SetResourceMargins(layoutIndex, index, marginStart, marginEnd);
                        break;
                    }
    
                    index = (index + 1) | 0;
                }
            }
    
            if (autoLayout) {
                this.layout(true);
            }
        },
        _UpdateVisibleCalendars: function (visibleCalendarsSource) {
            var $t, $t1;
            var visibleCalendars = new Bridge.Collections.HashSet$1(String)("constructor");
            for (var i = 0; i < this._Options.numberOfVisibleDays; i = (i + 1) | 0) {
                $t = Bridge.getEnumerator(visibleCalendarsSource);
                while ($t.moveNext()) {
                    var k = $t.getCurrent();
                    visibleCalendars.add$1(k + "@" + i.toString());
                }
            }
    
    
            var calendarsAxis = this._Options.layout.inverseDirection ? 1 : 0;
    
            var layoutSuspended = false;
    
            for (var layoutIndex = 1; layoutIndex <= 3; layoutIndex = (layoutIndex + 1) | 0) {
                var li = (calendarsAxis === 0 ? this._GetLayoutElement(layoutIndex, 0) : this._GetLayoutElement(0, layoutIndex));
                var ranges = calendarsAxis === 0 ? li.grid._Columns : li.grid._Rows;
                var index = 0;
                $t1 = Bridge.getEnumerator(ranges);
                while ($t1.moveNext()) {
                    var range = $t1.getCurrent();
                    var cID = this._CalendarsLayout[layoutIndex].getItem(index);
    
                    if (visibleCalendars.contains(cID)) {
                        if (range.hidden === true) {
                            if (layoutSuspended === false) {
                                this.suspendLayout();
                                layoutSuspended = true;
                            }
                            this._ShowHideResource(layoutIndex, index, false);
                        }
                    }
                    else  {
                        if (range.hidden === false) {
                            if (layoutSuspended === false) {
                                this.suspendLayout();
                                layoutSuspended = true;
                            }
    
                            this._ShowHideResource(layoutIndex, index, true);
                        }
                    }
    
                    index = (index + 1) | 0;
                }
            }
    
            if (layoutSuspended) {
                this.resumeLayout();
            }
        }
    });
    
    Bridge.ns("GridControls.Scheduler", $_)
    
    Bridge.apply($_.GridControls.Scheduler, {
        f1: function (gc) {
            var cellHour = Bridge.cast(gc.itemData, Bridge.Int32);
            gc.position.axisIndex = (cellHour - this._Options.firstHour) | 0;
            gc.position.start = 0;
            gc.position.end = 0;
    
            if (Bridge.hasValue(this._Options.template.hoursTemplate)) {
                gc.htmlContent = this._Options.template.hoursTemplate(cellHour);
            }
    
            return true;
        },
        f2: function (s) {
            return s.receivedOrder;
        },
        f3: function (i) {
            return i.itemID;
        },
        f4: function (i) {
            return Bridge.Array.contains(this._DisplayedItems.getKeys(), i) === false;
        },
        f5: function (i) {
            return Bridge.Array.contains(this._DisplayedItems.getKeys(), i);
        },
        f6: function () {
            if (!Bridge.hasValue(this._Options)) {
                return;
            }
    
            this.layout(true);
            if (Bridge.hasValue(this._Options.callbacks.onDateChanged)) {
                this._Options.callbacks.onDateChanged(this, this._Options.viewDate);
            }
        },
        f7: function (d) {
            return d.key;
        },
        f8: function (e) {
            this.m_UpdateCurrentTimeDisabled = true;
            var list = document.querySelectorAll(":hover");
            for (var i = (list.length - 1) | 0; i >= 0; i = (i - 1) | 0) {
                if (list[i].classList.contains("grid-viewport")) {
                    this.m_LastTouchedViewPort = list[i];
                    break;
                }
            }
        },
        f9: function (e) {
            //m_CurrentTouchedElement = null;
            this.m_UpdateCurrentTimeDisabled = false;
            if (this.m_UpdateCurrentTimeRequested) {
                this._UpdateCurrentTimeElementEx(false);
            }
        },
        f10: function () {
            if (!Bridge.hasValue(this._Options)) {
                return;
            }
            this._ClickDisabled = false;
        },
        f11: function () {
            if (!Bridge.hasValue(this._Options)) {
                return;
            }
    
            this._DoubleClickTimer = null;
    
            //  Simple clic
            //_RaiseMouseEvent(e, "scheduler.click", clickedHtmlElements);
        },
        f12: function (l) {
            return l.layerElement;
        },
        f13: function (c) {
            return c.pinned === GridControls._PinSide.left;
        },
        f14: function (c) {
            return c.pinned === GridControls._PinSide.none;
        },
        f15: function (c) {
            return c.pinned === GridControls._PinSide.right;
        }
    });
    
    /**
     * Grille générique permettant d'afficher tout et n'importe quoi
     *
     * @public
     * @class GridControls.Grid
     * @augments GridControls._BaseGrid
     */
    Bridge.define('GridControls.Grid', {
        inherits: [GridControls._BaseGrid],
        statics: {
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
            create: function (options, identifier) {
                if (options === void 0) { options = null; }
                if (identifier === void 0) { identifier = null; }
                return new GridControls.Grid(options, identifier);
            },
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
            query$1: function (selector) {
                var result = $(selector);
    
                if (result.length === 0) {
                    return null;
                }
    
                var grid = Bridge.as(result.first().data("iwc-grid-class"), GridControls.Grid);
                return grid;
            },
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
            query: function (element) {
                if (!Bridge.hasValue(element)) {
                    return null;
                }
    
                var result = $(element);
                if (result.length === 0) {
                    return null;
                }
    
                var grid = Bridge.as(result.first().data("iwc-grid-class"), GridControls.Grid);
                return grid;
            }
        },
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
        constructor: function (options, identifier) {
            if (options === void 0) { options = null; }
            if (identifier === void 0) { identifier = null; }
    
            GridControls._BaseGrid.prototype.$constructor.call(this, options, identifier);
    
        },
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
        addColumn: function (data, width, unit, minWidthInPixels, maxPctWidth) {
            if (minWidthInPixels === void 0) { minWidthInPixels = 0; }
            if (maxPctWidth === void 0) { maxPctWidth = 0; }
            var range = new GridControls._GridRange();
            range.data = data;
            range.minSize = minWidthInPixels;
            range.sizeUnit = unit;
            range.size = width;
            range.maxPctSize = maxPctWidth;
            range.hidden = width === 0;
            this._Columns.add(range);
            this.layout(true);
    
            return range.iD;
        },
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
        addRow: function (data, height, unit, minHeightInPixels, maxPctHeight) {
            if (minHeightInPixels === void 0) { minHeightInPixels = 0; }
            if (maxPctHeight === void 0) { maxPctHeight = 0; }
            var range = new GridControls._GridRange();
            range.data = data;
            range.minSize = minHeightInPixels;
            range.sizeUnit = unit;
            range.size = height;
            range.maxPctSize = maxPctHeight;
            range.hidden = height === 0;
            this._Rows.add(range);
            this.layout(true);
    
            return range.iD;
        },
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
        addColumns: function (columns, width, unit, minWidthInPixels) {
            var $t;
            if (minWidthInPixels === void 0) { minWidthInPixels = 0; }
            var ids = new Bridge.List$1(Bridge.Int32)();
    
            this.suspendLayout();
            $t = Bridge.getEnumerator(columns);
            while ($t.moveNext()) {
                var o = $t.getCurrent();
                ids.add(this.addColumn(columns, width, unit, minWidthInPixels));
            }
            this.resumeLayout();
    
            return ids.toArray();
        },
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
        addRows: function (rows, height, unit, minHeightInPixels) {
            var $t;
            if (minHeightInPixels === void 0) { minHeightInPixels = 0; }
            var ids = new Bridge.List$1(Bridge.Int32)();
    
            this.suspendLayout();
            $t = Bridge.getEnumerator(rows);
            while ($t.moveNext()) {
                var o = $t.getCurrent();
                ids.add(this.addRow(rows, height, unit, minHeightInPixels));
            }
            this.resumeLayout();
    
            return ids.toArray();
        },
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
        addLayer: function (flowDirection, cssClasses, overlapingEnabled, itemsPaddingStart, itemsPaddingEnd) {
            var $t;
            if (cssClasses === void 0) { cssClasses = null; }
            if (overlapingEnabled === void 0) { overlapingEnabled = true; }
            if (itemsPaddingStart === void 0) { itemsPaddingStart = 0; }
            if (itemsPaddingEnd === void 0) { itemsPaddingEnd = 0; }
            this.suspendLayout();
            var layer = new GridControls._GridLayer(this);
            layer.overlapingEnabled = overlapingEnabled;
            layer.flowDirection = flowDirection;
            layer.itemsPaddingStart = itemsPaddingStart;
            layer.itemsPaddingEnd = itemsPaddingEnd;
    
            if (Bridge.hasValue(cssClasses)) {
                $t = Bridge.getEnumerator(cssClasses);
                while ($t.moveNext()) {
                    var c = $t.getCurrent();
                    if (Bridge.String.isNullOrEmpty(c) === false) {
                        layer.layerElement.classList.add(c);
                    }
                }
            }
    
            this._Layers.add(layer.iD, layer);
            this.resumeLayout();
            return layer.iD;
        },
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
        removeAllLayerItems: function (layerID) {
            var layer = this._Layers.get(layerID);
            layer.removeAllItems();
        },
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
        addItems: function (layerID, items, customizeCallback) {
            var $t, $t1, $t2;
            var layer = this._Layers.get(layerID);
            var ids = new Bridge.List$1(Bridge.Int32)();
    
            this.suspendLayout();
            $t = Bridge.getEnumerator(items);
            while ($t.moveNext()) {
                var $t1 = (function () {
                    var o = $t.getCurrent();
                    var item = new GridControls._LayerItem(layer);
                    var cgi = new GridControls.GridCustomizeItem();
                    cgi.position = new GridControls.ItemPosition();
                    cgi.itemData = o;
                    cgi._LayerItemID = item.iD;
                    cgi._Element = item.element;
    
                    var r = customizeCallback(cgi);
                    if (Bridge.Nullable.hasValue(r) && Bridge.Nullable.getValue(r) === false) {
                        return {jump:1};
                    }
    
                    item.data = o;
                    item.axisIndex = cgi.position.axisIndex;
                    item.start = cgi.position.start;
                    item.end = cgi.position.end;
                    item.paddingStart = cgi.position.paddingStart;
                    item.paddingEnd = cgi.position.paddingEnd;
                    item.itemStartOffset = cgi.position.itemStartOffset;
                    item.itemEndOffset = cgi.position.itemEndOffset;
    
                    item.layer._InvalidatedRanges.add$1(item.axisIndex);
    
                    if (item.element !== cgi._Element) {
                        item.element.parentElement.replaceChild(cgi._Element, item.element);
                        item.element = cgi._Element;
                        item.element.dataset.gridelementid = item.iD.toString();
                    }
    
                    if (Bridge.hasValue(cgi.cssClasses)) {
                        $t2 = Bridge.getEnumerator(cgi.cssClasses);
                        while ($t2.moveNext()) {
                            var c = $t2.getCurrent();
                            item.element.classList.add(c);
                        }
                    }
    
                    if (Bridge.String.isNullOrWhiteSpace(cgi.htmlContent) === false) {
                        Bridge.Linq.Enumerable.from($.parseHTML(cgi.htmlContent)).select($_.GridControls.Grid.f1).forEach(function (e) {
                            e.appendTo(item.element);
                        });
                    }
    
                    layer.addItem(item);
                    ids.add(item.iD);
                }).call(this) || {};
                if($t1.jump == 1) continue;
            }
            //layer.InvalidateCells();
            this.resumeLayout();
    
            return ids.toArray();
        },
        updateItemPosition: function (layerID, itemID, itemobject, customizeCallback) {
            var layer = this._Layers.get(layerID);
    
            if (layer._Items.containsKey(itemID) === false) {
                return;
            }
    
            this.suspendLayout();
    
            var item = layer._Items.get(itemID);
            item.layer._InvalidatedRanges.add$1(item.axisIndex);
    
            var cgi = new GridControls.GridCustomizeItem();
            cgi.position = new GridControls.ItemPosition();
            cgi.itemData = itemobject;
            cgi._LayerItemID = item.iD;
    
            var r = customizeCallback(cgi);
            if (Bridge.Nullable.hasValue(r) && Bridge.Nullable.getValue(r) === false) {
                return;
            }
    
            item.data = itemobject;
            item.axisIndex = cgi.position.axisIndex;
            item.start = cgi.position.start;
            item.end = cgi.position.end;
            item.paddingStart = cgi.position.paddingStart;
            item.paddingEnd = cgi.position.paddingEnd;
            item.itemStartOffset = cgi.position.itemStartOffset;
            item.itemEndOffset = cgi.position.itemEndOffset;
    
            item.layer._InvalidatedRanges.add$1(item.axisIndex);
            //item.Element.ClassName = "";
    
            //jQuery.Select(item.Element).Empty();
            /* 
                if (cgi.CssClasses != null)
                {
                    foreach (string c in cgi.CssClasses)
                        item.Element.ClassList.Add(c);
                }*/
    
            //if (String.IsNullOrWhiteSpace(cgi.HtmlContent) == false)
            //jQuery.ParseHTML(cgi.HtmlContent).Select(e => jQuery.Select(e)).ForEach(e => e.AppendTo(item.Element));
    
            //layer.InvalidateCells();
            this.resumeLayout();
        },
        _RemoveItemFromLayers: function (itemID) {
            var $t;
            $t = Bridge.getEnumerator(this._Layers.getValues());
            while ($t.moveNext()) {
                var layer = $t.getCurrent();
                var element = layer.removeItem(itemID);
                if (Bridge.hasValue(element)) {
                    return element;
                }
            }
            return null;
        },
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
        removeLayer: function (layer) {
            if (this._Layers.containsKey(layer.iD) === false) {
                return false;
            }
    
            layer._Dispose();
            return true;
        }
    });
    
    Bridge.ns("GridControls.Grid", $_)
    
    Bridge.apply($_.GridControls.Grid, {
        f1: function (e) {
            return $(e);
        }
    });
    
            // module export
            if (typeof define === "function" && define.amd) {
                // AMD
                define("gridControls", [], function () { return GridControls; });
            } else if (typeof module !== "undefined" && module.exports) {
                // Node
                module.exports = GridControls;
            }

    Bridge.init();

})(this);
