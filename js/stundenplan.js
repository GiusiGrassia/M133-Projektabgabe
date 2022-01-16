//DOM ready - Shorthand
$(document).ready(function() {
    
    //Moment js
    moment.locale('de-CH'); //Korrekte Sprache definieren
    let actualDate = moment(); //actualDate definieren

    //Mittlere Pagination Anzeige
    function weekPagination() {
        currentWeek = actualDate.format('W') + '-' + actualDate.format('Y'); //currentWeek definieren mit Wochen- und Jahresanzeige
        $('#currW').html('<a class="page-link">' + currentWeek + '</a>'); //li currW -> currentWeek setzen
    };

    //Eine Woche vorwärts
    function weekForward() {
        actualDate = actualDate.add(1, 'W'); //Plus eine Woche ausgehend vom actualDate
        weekPagination(); //Aufruf Funktion "weekPagination"
    };

    //Eine Woche rückwärts
    function weekBackward() {
        actualDate = actualDate.subtract(1, 'W'); //Minus eine Woche ausgehend vom actualDate
        weekPagination(); //Aufruf Funktion "weekPagination"
    };

    //Aufruf Funktion "weekPagination"
    weekPagination();

    //Aufruf Funktion "loadBerufsgruppe"
    loadBerufsgruppen();

    //Funktion zum leeren der Klassenauswahl
    function clearKlassenauswahl() {
        $('#klassenauswahl').empty();// div "klassenauswahl" wird geleert
    };
    //Funktion zum löschen des "savedKlasse" Key aus dem LocalStorage
    function clearLocalStorageKeySavedKlasse() {
        localStorage.removeItem('savedKlasse'); //LocalStorage Key "savedKlasse" löschen
    }

    //Funktion zum leeren des Stundenplans
    function clearStundenplan() {
        $('#stundenplan').empty(); //div "stundenplan" wird geleert (gelöscht)
        $('#emptySchedule').empty(); //div "emptySchedule" wird geleert (gelöscht)
        $('#error').empty(); //div "erorr" wird geleert (gelöscht)
    };

    // Ajax Request Berufsgruppe
    function loadBerufsgruppen() {
        $.ajax({
            type: "GET",
            url: "http://sandbox.gibm.ch/berufe.php",
            data: { format: 'JSON' }, // format mitgeben
            dataType: 'json'
        }).done(function(data) {
            // Option zur "Aufforderung der Auswahl" vor den gelieferten Daten anhängen
            $('#berufsgruppe').append('<option>Berufsgruppe auswählen ... </option>');
            // Loop bis alle gelieferten Daten als Option angehängt wurden
            $.each(data, function(key, berufe) {
                // Optionen anhängen, beruf_id als value setzen und beurf_name als Text setzen
                $('#berufsgruppe').append('<option value=' + berufe.beruf_id + '>' + berufe.beruf_name + '</option>');
            })
            //Check ob es bereits einen LocalStorage Key für die Berufsgruppe exisitert
            if (localStorage.getItem('savedBeruf') !== null) {
                $('#berufsgruppe').val(localStorage.getItem('savedBeruf')); //Select-Box Option setzen anhand der im "savedBeruf" Key gespeicherten Value.
                load_klassenauswahl(localStorage.getItem('savedBeruf')); //Aufruf Funktion "load_klassenauswahl" mit weitergabe der im "savedBeruf" Key gespeicherten Value.

            }else {
                //Select-Box "Klassenauswahl" deaktivieren
                $('#klassenauswahl').prop('disabled',true);
            }
        }).fail(function() {
            // Fehlermeldung - #001 | Fehler im Bereich Berufsgruppe
            $('#error').html('<div class="alert alert-danger">Error Code #001</div>').fadeIn();
        });
    }


    // Change Handler Berufsgruppe
    $('#berufsgruppe').change(function(e) {

        //Localstorage Key "savedBeruf" mit der Beruf ID speichern.
        localStorage.setItem('savedBeruf', this.value);

        //Aufruf Funktion "clearKlassenauswahl"
        clearKlassenauswahl();

        //Aufruf Funktion "clearLocalStorageKeySavedKlasse"
        clearLocalStorageKeySavedKlasse();

        //Aufruf Funktion "clearStundenplan"
        clearStundenplan();

        //Aufruf Funktion "load_klassenauswahl" mit der ID der gewählten Berufsgruppe
        load_klassenauswahl(this.value);

        //Select-Box "Klassenauswahl" aktivieren
        $('#klassenauswahl').prop('disabled',false);

    });

    // Ajax Request Klassenauswahl
    function load_klassenauswahl(beruf_id) {
        $.ajax({
            type: "GET",
            url: 'http://sandbox.gibm.ch/klassen.php?beruf_id=' + beruf_id, //Übergabe der beruf_id
            data: { format: 'JSON' },
            dataType: 'json'
        }).done(function(data) {
            // Option zur "Aufforderung der Auswahl" vor den gelieferten Daten anhängen
            $('#klassenauswahl').append('<option>Klasse auswählen ... </option>');
            // Loop bis alle gelieferten Daten als Option angehängt wurden
            $.each(data, function(key, klasse) {
                // Optionen anhängen, klasse_id als value setzen und klasse_longname als Text setzen
                $('#klassenauswahl').append('<option value=' + klasse.klasse_id + '>' + klasse.klasse_longname + '</option>');
            })
            //Check ob es bereits einen LocalStorage Key für die Klassenauswahl exisitert
            if (localStorage.getItem('savedKlasse') !== null) {
                $('#klassenauswahl').val(localStorage.getItem('savedKlasse')); //Select-Box Option setzen anhand der im "savedKlasse" Key gespeicherten Value.
                loadStundenplan(localStorage.getItem('savedKlasse')); //Aufruf Funktion "load_klassenauswahl" mit weitergabe der im "savedBeruf" Key gespeicherten Value.
            }
        }).fail(function() {
            // Fehlermeldung - #002 | Fehler im Bereich Klassenauswahl
            $('#error').html('<div class="alert alert-danger">Error Code #002</div>').fadeIn();
        });
    };

    // Change Handler Klassenwahl
    $('#klassenauswahl').change(function(e) {

        //Localstorage Key "savedKlasse" mit der Klassen ID speichern.
        localStorage.setItem('savedKlasse', this.value);

        //Aufruf Funktion "clearStundenplan"
        clearStundenplan();

        //Aufruf Funktion "loadStundeplan" mit übergabe der klasse_id
        loadStundenplan(this.value);
    });

    // Ajax Request Stundenplan
    function loadStundenplan(klasse_id) {
        $('#stundenplan').fadeOut(function() { //Tabelle ausblenden
            $.ajax({
                type: "GET",
                url: 'https://sandbox.gibm.ch/tafel.php?klasse_id=' + klasse_id + '&woche=' + actualDate.format('W') + '-' + actualDate.format('Y'),
                data: { format: 'json' },
                dataType: 'json'
            }).done(function(data) {
                // Wenn  Daten vorhanden sind ...
                if (data != '') {
                    // Bootstrap Tabelle generieren
                    $('#stundenplan').append('<table class="table"><tr><th>Datum</th><th>Wochentag</th><th>Von</th><th>Bis</th><th>Lehrer</th><th>Fach</th><th>Raum</th></tr></table>');
                    // Loop für alle vorhandenen Termine
                    $.each(data, function(key, tafel) {

                        // Tabellenzeilen anfügen   
                        $('#stundenplan table').append('<tr><td>' + moment(tafel.tafel_datum, 'YYYY-MM-DD').format('DD.MM.YYYY') + //Spalte Datum ausfüllen
                            '</td><td>' + moment(tafel.tafel_wochentag, 'd').format('dddd') + //Spalte Wochtentag ausfüllen
                            '</td><td>' + moment(tafel.tafel_von, 'hh:mm:ss').format('HH:mm') + //Spalte Von ausfüllen
                            '</td><td>' + moment(tafel.tafel_bis, 'hh:mm:ss').format('HH:mm') + //spalte Bis ausfüllen
                            '</td><td>' + tafel.tafel_lehrer + //Spalte Lehrer ausfüllen
                            '</td><td>' + tafel.tafel_longfach + //Spalte Fach ausfüllen
                            '</td><td>' + tafel.tafel_raum + //Spalte Raum ausfüllen
                            '</td></tr>');

                        $('#stundenplan').fadeIn(); //Tabelle einblenden
                    })
                } else {
                    // Meldung ausgeben
                    $('#emptySchedule').html('<div class="alert alert-warning text-center">Es wurden in dieser Woche keine Daten gefunden.<br>Evtl. findet in dieser Woche kein Unterricht statt, oder es wurden für diesen Zeitraum noch keine Daten eingegeben.</div>').fadeIn();
                }
            }).fail(function() {
                // Fehlermeldung - #003 | Fehler im Bereich Tabelle
                $('#error').html('<div class="alert alert-danger">Error Code #003</div>').fadeIn();
            });
        });
    };

    //Event Handler um eine Woche vorher anzuzeigen
    $('#prevW').click(function(e) {
        weekBackward(); //Aufruf Funktion "weekBackward"
        clearStundenplan(); //Aufruf Funktion "clearStundenplan"
        loadStundenplan($('#klassenauswahl').val()); //Aufruf Funktion "loadStundenplan" mit übergabe der aktuellen Klassenauswahl 
    });

    //Event Handler um eine Woche nachher anzuzeigen
    $('#nextW').click(function(e) {
        weekForward(); //Aufruf Funktion "weekForward"
        clearStundenplan(); //Aufruf Funktion "clearStundenplan"
        loadStundenplan($('#klassenauswahl').val()); //Aufruf Funktion "loadStundenplan" mit übergabe der aktuellen Klassenauswahl 
    });

    //Event Handler um die aktuelle Woche anzuzeigen
    $('#currW').click(function(e) {
        actualDate = moment(); //actualDate wieder auf das heutige Datum setzen
        weekPagination(); //Aufruf Funktion "weekPagination"
        clearStundenplan(); //Aufruf Funktion "clearStundenplan"
        loadStundenplan($('#klassenauswahl').val()); //Aufruf Funktion "loadStundenplan" mit übergabe der aktuellen Klassenauswahl 
    });


});