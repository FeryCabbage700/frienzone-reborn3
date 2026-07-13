"use strict";

/*=========================================================
    FRIENDZONÉ REBORN
    moteur.js
=========================================================*/

const moteur = {

    chapitreActuel: 0,
    sceneActuelle: "",
    chapitre: null,

    timerChoix: null,

    joueur: {

        relationEva: 0,
        confianceEva: 0,

        relationEmelyne: 0,
        confianceEmelyne: 0,

        relationZoe: 0,
        confianceZoe: 0,

        gentillesse: 0,
        courage: 0,
        humour: 0,

        rencontreEva: false,
        rencontreEmelyne: false,
        rencontreZoe: false

    },


    /*=====================================================
        INITIALISATION
    =====================================================*/

    async initialiser() {

        try {

            this.initialiserTransition();

            await chapitresManager.charger();

            if (chapitresManager.nombre() === 0) {

                this.afficherErreur(
                    "Aucun chapitre n'a pu être chargé."
                );

                return;

            }

            const sauvegarde =
                sauvegardeManager.charger();

            if (sauvegarde) {

                this.appliquerSauvegarde(
                    sauvegarde
                );

            }
            else {

                this.nouvellePartie();

            }

        }
        catch (erreur) {

            console.error(
                "Erreur d'initialisation :",
                erreur
            );

            this.afficherErreur(
                "Une erreur est survenue pendant le chargement du jeu."
            );

        }

    },


    /*=====================================================
        TRANSITION D'ENTRÉE
    =====================================================*/

    initialiserTransition() {

        const transition =
            document.getElementById(
                "transition"
            );

        if (!transition) {

            return;

        }

        setTimeout(() => {

            transition.classList.remove(
                "actif"
            );

            transition.style.opacity = "0";

        }, 100);

    },


    /*=====================================================
        NOUVELLE PARTIE
    =====================================================*/

    nouvellePartie() {

        const premierChapitre =
            chapitresManager.obtenir(0);

        if (!premierChapitre) {

            this.afficherErreur(
                "Le chapitre 1 est introuvable."
            );

            return;

        }

        this.chapitreActuel = 0;

        this.sceneActuelle =
            premierChapitre.debut;

        this.joueur =
            sauvegardeManager
                .creerJoueurParDefaut();

        if (
            typeof dialogueManager !==
            "undefined"
        ) {

            dialogueManager.vider();

        }

        this.sauvegarder();

        this.chargerChapitre(
            0,
            this.sceneActuelle
        );

    },


    /*=====================================================
        APPLIQUER UNE SAUVEGARDE
    =====================================================*/

    appliquerSauvegarde(
        sauvegarde
    ) {

        this.chapitreActuel =
            sauvegarde.chapitre ?? 0;

        this.sceneActuelle =
            sauvegarde.scene || "";

        this.joueur = {

            ...sauvegardeManager
                .creerJoueurParDefaut(),

            ...(sauvegarde.joueur || {})

        };

        this.chargerChapitre(

            this.chapitreActuel,

            this.sceneActuelle

        );

    },


    /*=====================================================
        SAUVEGARDE
    =====================================================*/

    sauvegarder() {

        sauvegardeManager.sauvegarder({

            chapitre:
                this.chapitreActuel,

            scene:
                this.sceneActuelle,

            joueur:
                this.joueur,

            musique:

                typeof audioManager !==
                "undefined"

                    ? audioManager
                        .musiqueActuelle

                    : "",

            ambiance:

                typeof audioManager !==
                "undefined"

                    ? audioManager
                        .ambianceActuelle

                    : ""

        });

    },


    /*=====================================================
        CHARGER UN CHAPITRE
    =====================================================*/

    chargerChapitre(
        numero,
        sceneDepart = null
    ) {

        const chapitre =
            chapitresManager.obtenir(
                numero
            );

        if (!chapitre) {

            this.afficherErreur(
                "Chapitre introuvable : " +
                (numero + 1)
            );

            return;

        }

        this.annulerTimerChoix();

        this.chapitreActuel =
            numero;

        this.chapitre =
            chapitre;

        const titre =
            document.getElementById(
                "titre"
            );

        if (titre) {

            titre.textContent =
                chapitre.titre;

        }

        if (
            chapitre.musique &&
            typeof audioManager !==
            "undefined"
        ) {

            audioManager.changerMusique(
                chapitre.musique
            );

        }

        const sceneInitiale =

            sceneDepart ||

            chapitre.debut;

        this.chargerScene(
            sceneInitiale
        );

    },


    /*=====================================================
        CHARGER UNE SCÈNE
    =====================================================*/

    chargerScene(id) {

        if (!this.chapitre) {

            this.afficherErreur(
                "Aucun chapitre n'est chargé."
            );

            return;

        }

        const scene =
            this.chapitre.scenes[id];

        if (!scene) {

            this.afficherErreur(
                "Scène introuvable : " +
                id
            );

            return;

        }

        this.annulerTimerChoix();

        if (
            typeof choixManager !==
            "undefined"
        ) {

            choixManager.fermerPopup();

            choixManager.vider();

        }


        /* Vérifie l'accès à la scène */

        const accesAutorise =
            conditionsManager
                .verifierAccesScene(
                    scene,
                    this.joueur
                );

        if (!accesAutorise) {

            if (scene.sinon) {

                this.chargerScene(
                    scene.sinon
                );

            }
            else {

                this.afficherErreur(
                    "Cette scène n'est pas accessible."
                );

            }

            return;

        }


        /* Vérifie une redirection automatique */

        const redirection =
            conditionsManager
                .obtenirRedirection(
                    scene,
                    this.joueur
                );

        if (redirection) {

            this.gererDestination(
                redirection
            );

            return;

        }


        this.sceneActuelle =
            id;


        /* Audio */

        this.gererAudioScene(
            scene
        );


        /* Dialogues */

        dialogueManager.afficherScene(
            scene
        );


        /* Préparation des choix */

        const choixDisponibles =
            conditionsManager
                .preparerChoix(
                    scene.choix || [],
                    this.joueur
                );


        /* Délai de lecture */

        const delaiChoix =
            this.calculerDelaiLecture(
                scene
            );


        if (
            choixDisponibles.length > 0
        ) {

            this.timerChoix =
                setTimeout(() => {

                    choixManager.afficher(
                        choixDisponibles
                    );

                    this.timerChoix =
                        null;

                }, delaiChoix);

        }


        this.sauvegarder();

    },


/*=====================================================
    CALCULER LE DÉLAI DE LECTURE
=====================================================*/

calculerDelaiLecture(scene) {

    if (!scene) {
        return 4000;
    }

    let nombreCaracteres = 0;
    let nombreMessages = 0;

    if (Array.isArray(scene.dialogues)) {

        nombreMessages =
            scene.dialogues.length;

        scene.dialogues.forEach(message => {

            nombreCaracteres +=
                String(
                    message.texte || ""
                ).length;

        });

    }
    else if (scene.texte) {

        nombreMessages = 1;

        nombreCaracteres =
            String(scene.texte).length;

    }

    /*
        Temps de lecture :
        - 45 ms par caractère ;
        - 700 ms supplémentaires par bulle ;
        - minimum de 4 secondes ;
        - maximum de 20 secondes.
    */

    const delaiMinimum = 4000;
    const delaiMaximum = 20000;

    const delaiParCaractere = 45;
    const delaiParMessage = 700;

    const delaiCalcule =

        nombreCaracteres *
        delaiParCaractere

        +

        nombreMessages *
        delaiParMessage;

    return Math.min(

        Math.max(
            delaiCalcule,
            delaiMinimum
        ),

        delaiMaximum

    );

},


    /*=====================================================
        ANNULER LE TIMER DES CHOIX
    =====================================================*/

    annulerTimerChoix() {

        if (!this.timerChoix) {

            return;

        }

        clearTimeout(
            this.timerChoix
        );

        this.timerChoix =
            null;

    },


    /*=====================================================
        TRAITER UN CHOIX
    =====================================================*/

    traiterChoix(choix) {

        if (!choix) {

            return;

        }

        this.annulerTimerChoix();


        if (choix.verrouille) {

            dialogueManager.notification(

                choix.messageVerrouille ||

                "Ce choix n'est pas disponible."

            );

            return;

        }


        /*
            Message affiché dans la conversation.

            Le bouton peut avoir un texte court,
            tandis que la bulle peut être plus naturelle.
        */

        const messageAffiche =

            choix.message?.texte ||

            choix.texte ||

            "";


        const personnage =

            choix.message?.personnage ||

            "joueur";


        dialogueManager.ajouterMessage(

            messageAffiche,

            personnage

        );


        /* Son */

        if (
            choix.son &&
            typeof audioManager !==
            "undefined"
        ) {

            audioManager.jouerSon(

                choix.son,

                choix.volumeSon

            );

        }


        /* Effet simple */

        conditionsManager
            .appliquerEffet(

                choix.effet,

                this.joueur

            );


        /* Effets multiples */

        conditionsManager
            .appliquerEffets(

                choix.effets,

                this.joueur

            );


        /* Destination */

        const destination =
            conditionsManager
                .resoudreDestination(

                    choix,

                    this.joueur

                );


        this.sauvegarder();


        /*
            Petit délai pour laisser la bulle
            du joueur apparaître avant la suite.
        */

        setTimeout(() => {

            this.gererDestination(
                destination
            );

        }, 450);

    },


    /*=====================================================
        GÉRER UNE DESTINATION
    =====================================================*/

    gererDestination(
        destination
    ) {

        if (!destination) {

            console.warn(
                "Destination manquante."
            );

            return;

        }


        if (
            destination.startsWith(
                "chapitre"
            )
        ) {

            const numero =

                Number.parseInt(

                    destination.replace(

                        "chapitre",

                        ""

                    ),

                    10

                );


            if (
                Number.isNaN(numero)
            ) {

                this.afficherErreur(
                    "Destination invalide : " +
                    destination
                );

                return;

            }


            this.changerChapitre(
                numero - 1
            );

            return;

        }


        this.chargerScene(
            destination
        );

    },


    /*=====================================================
        CHANGER DE CHAPITRE
    =====================================================*/

    changerChapitre(numero) {

        const chapitre =
            chapitresManager.obtenir(
                numero
            );

        if (!chapitre) {

            this.afficherErreur(
                "Chapitre introuvable : " +
                (numero + 1)
            );

            return;

        }

        this.annulerTimerChoix();

        this.chapitreActuel =
            numero;

        this.sceneActuelle =
            chapitre.debut;

        this.sauvegarder();


        if (
            typeof dialogueManager !==
            "undefined"
        ) {

            dialogueManager.vider();

        }


        if (
            typeof animationManager !==
            "undefined"
        ) {

            animationManager
                .transitionVersNoir(
                    () => {

                        this.chargerChapitre(
                            numero
                        );

                        setTimeout(() => {

                            animationManager
                                .sortirDuNoir();

                        }, 150);

                    }
                );

            return;

        }


        this.chargerChapitre(
            numero
        );

    },


    /*=====================================================
        AUDIO D'UNE SCÈNE
    =====================================================*/

    gererAudioScene(scene) {

        if (
            typeof audioManager ===
            "undefined"
        ) {

            return;

        }


        if (scene.musique) {

            audioManager
                .changerMusique(
                    scene.musique
                );

        }


        if (scene.ambiance) {

            audioManager
                .jouerAmbiance(
                    scene.ambiance
                );

        }


        if (
            scene.arreterAmbiance ===
            true
        ) {

            audioManager
                .arreterAmbiance();

        }


        if (scene.son) {

            audioManager.jouerSon(

                scene.son,

                scene.volumeSon

            );

        }

    },


    /*=====================================================
        TERMINER LE JEU
    =====================================================*/

    terminerJeu(
        nomFin = "finNeutre"
    ) {

        this.annulerTimerChoix();


        const fins =

            JSON.parse(

                localStorage.getItem(

                    "finsDebloquees"

                ) || "[]"

            );


        if (
            !fins.includes(
                nomFin
            )
        ) {

            fins.push(
                nomFin
            );

        }


        localStorage.setItem(

            "finsDebloquees",

            JSON.stringify(
                fins
            )

        );


        this.sauvegarder();


        if (
            typeof audioManager !==
            "undefined"
        ) {

            audioManager.fadeOut(
                1200
            );

            audioManager
                .arreterAmbiance();

        }


        if (
            typeof animationManager !==
            "undefined"
        ) {

            animationManager
                .transitionVersNoir(
                    () => {

                        window.location.href =
                            "index.html";

                    }
                );

            return;

        }


        window.location.href =
            "index.html";

    },


    /*=====================================================
        AFFICHER UNE ERREUR
    =====================================================*/

    afficherErreur(message) {

        console.error(
            message
        );

        this.annulerTimerChoix();


        const texte =
            document.getElementById(
                "texte"
            );

        const choix =
            document.getElementById(
                "choix"
            );


        if (texte) {

            texte.innerHTML =

                `<div class="message narration">

                    <div class="bulle">

                        ${message}

                    </div>

                </div>`;

        }


        if (choix) {

            choix.innerHTML = "";

        }


        if (
            typeof choixManager !==
            "undefined"
        ) {

            choixManager
                .fermerPopup();

        }

    }

};


/*=========================================================
    DÉMARRAGE
=========================================================*/

window.addEventListener(

    "load",

    () => {

        moteur.initialiser();

    }

);

