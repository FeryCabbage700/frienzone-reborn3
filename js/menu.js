"use strict";

/*=========================================================
    FRIENDZONÉ REBORN
    menu.js
=========================================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*=================================================
            ÉLÉMENTS DU MENU
        =================================================*/

        const transition =
            document.getElementById(
                "transition"
            );

        const musiquemenu =
            document.getElementById(
                "musiquemenu"
            );

        const boutonNouvellePartie =
            document.getElementById(
                "nouvellePartie"
            );

        const boutonContinuer =
            document.getElementById(
                "continuer"
            );

        const boutonCharger =
            document.getElementById(
                "charger"
            );

        const boutonGalerie =
            document.getElementById(
                "galerie"
            );

        const boutonSucces =
            document.getElementById(
                "succes"
            );

        const boutonParametres =
            document.getElementById(
                "parametres"
            );

        const boutonCredits =
            document.getElementById(
                "credits"
            );

        const boutonQuitter =
            document.getElementById(
                "quitter"
            );


        let transitionEnCours =
            false;


        /*=================================================
            CLÉS UTILISÉES PAR LE MENU
        =================================================*/

        const CLE_NOUVELLE_PARTIE =
            "nouvellePartieDemandee";


        /*
            Plusieurs anciens noms possibles
            pour rester compatible avec les
            versions précédentes du projet.
        */

        const CLES_SAUVEGARDE_POSSIBLES = [

            "save",

            "sauvegarde",

            "friendzoneRebornSave",

            "friendzoneRebornSauvegarde",

            "friendzone_reborn_save"

        ];


        /*=================================================
            VÉRIFIER UNE SAUVEGARDE
        =================================================*/

        function sauvegardeExiste() {

            return CLES_SAUVEGARDE_POSSIBLES
                .some(
                    cle => {

                        const valeur =
                            localStorage.getItem(
                                cle
                            );

                        return (
                            valeur !== null &&
                            valeur !== ""
                        );

                    }
                );

        }


        function actualiserBoutonsSauvegarde() {

            const existe =
                sauvegardeExiste();


            if (boutonContinuer) {

                boutonContinuer.style.display =
                    existe
                        ? ""
                        : "none";

                boutonContinuer.disabled =
                    !existe;

            }


            if (boutonCharger) {

                boutonCharger.style.display =
                    existe
                        ? ""
                        : "none";

                boutonCharger.disabled =
                    !existe;

            }

        }


        /*=================================================
            MUSIQUE DU MENU
        =================================================*/

        function initialiserMusique() {

            if (!musiquemenu) {

                console.warn(
                    "menu.js : l'élément #musiquemenu est introuvable."
                );

                return;

            }

            musiquemenu.loop =
                true;

            musiquemenu.volume =
                0.4;


            /*
                Les navigateurs bloquent souvent
                la lecture automatique.
            */

            musiquemenu
                .play()
                .catch(
                    () => {

                        console.log(
                            "Le navigateur attend une interaction avant de lancer la musique."
                        );

                    }
                );

        }


        function demarrerMusiqueApresInteraction() {

            if (!musiquemenu) {

                return;

            }

            if (!musiquemenu.paused) {

                return;

            }

            musiquemenu
                .play()
                .catch(
                    erreur => {

                        console.warn(
                            "Impossible de lancer la musique du menu :",
                            erreur
                        );

                    }
                );

        }


        /*
            Le premier clic sur la page permet
            de lancer la musique si le navigateur
            l'avait bloquée.
        */

        document.addEventListener(
            "click",
            demarrerMusiqueApresInteraction,
            {
                once: true
            }
        );


        /*=================================================
            FONDU DE LA MUSIQUE
        =================================================*/

        function fadeOutMusique(
            duree = 1200
        ) {

            if (!musiquemenu) {

                return;

            }

            const intervalle =
                40;

            const volumeDepart =
                musiquemenu.volume;

            const nombreEtapes =
                Math.max(
                    1,
                    duree / intervalle
                );

            const diminution =
                volumeDepart /
                nombreEtapes;

            let volume =
                volumeDepart;


            const fade =
                setInterval(
                    () => {

                        volume -=
                            diminution;


                        if (volume <= 0) {

                            volume = 0;

                            clearInterval(
                                fade
                            );

                            musiquemenu.pause();

                            musiqueMenu.currentTime =
                                0;

                        }


                        musiquemenu.volume =
                            Math.max(
                                0,
                                volume
                            );

                    },
                    intervalle
                );

        }


        /*=================================================
            LANCER LE JEU
        =================================================*/

        function lancerJeu() {

            if (transitionEnCours) {

                return;

            }

            transitionEnCours =
                true;


            fadeOutMusique(
                1200
            );


            if (transition) {

                transition.classList.add(
                    "actif"
                );

            }


            setTimeout(
                () => {

                    window.location.href =
                        "jeu.html";

                },
                1200
            );

        }


        /*=================================================
            NOUVELLE PARTIE
        =================================================*/

        function demanderNouvellePartie() {

            const confirmation =
                window.confirm(
                    "Commencer une nouvelle partie ? La progression actuelle sera remplacée."
                );

            if (!confirmation) {

                return;

            }


            /*
                On ne crée aucune sauvegarde ici.

                Cette information indique simplement
                à moteur.js qu'il doit appeler
                nouvellePartie(), demander le prénom
                puis créer la vraie sauvegarde.
            */

            localStorage.setItem(
                CLE_NOUVELLE_PARTIE,
                "true"
            );


            lancerJeu();

        }


        /*=================================================
            CONTINUER
        =================================================*/

        function continuerPartie() {

            if (!sauvegardeExiste()) {

                window.alert(
                    "Aucune sauvegarde n'est disponible."
                );

                actualiserBoutonsSauvegarde();

                return;

            }


            /*
                S'assure que le moteur ne considère
                pas cette action comme une nouvelle partie.
            */

            localStorage.removeItem(
                CLE_NOUVELLE_PARTIE
            );


            lancerJeu();

        }


        /*=================================================
            CHARGER
        =================================================*/

        function chargerSauvegarde() {

            if (!sauvegardeExiste()) {

                window.alert(
                    "Aucune sauvegarde n'est disponible."
                );

                return;

            }


            window.alert(
                "Le système de plusieurs sauvegardes sera disponible prochainement."
            );

        }


        /*=================================================
            POPUPS
        =================================================*/

        function ouvrirPopup(id) {

            const popup =
                document.getElementById(
                    id
                );

            if (!popup) {

                console.warn(
                    `menu.js : popup introuvable : ${id}`
                );

                return;

            }

            popup.style.display =
                "flex";

            popup.classList.add(
                "ouverte"
            );

            popup.setAttribute(
                "aria-hidden",
                "false"
            );

        }


        function fermerPopup(popup) {

            if (!popup) {

                return;

            }

            popup.style.display =
                "none";

            popup.classList.remove(
                "ouverte"
            );

            popup.setAttribute(
                "aria-hidden",
                "true"
            );

        }


        function fermerToutesLesPopups() {

            document
                .querySelectorAll(
                    ".popup"
                )
                .forEach(
                    popup => {

                        fermerPopup(
                            popup
                        );

                    }
                );

        }


        /*
            Rend la fonction accessible aux boutons
            HTML utilisant onclick="fermerPopup()".
        */

        window.fermerPopup =
            fermerToutesLesPopups;


        /*
            Fermer une popup en cliquant
            sur son arrière-plan.
        */

        document
            .querySelectorAll(
                ".popup"
            )
            .forEach(
                popup => {

                    popup.addEventListener(
                        "click",
                        event => {

                            if (
                                event.target ===
                                popup
                            ) {

                                fermerPopup(
                                    popup
                                );

                            }

                        }
                    );

                }
            );


        /*
            Fermer avec la touche Échap.
        */

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Escape"
                ) {

                    fermerToutesLesPopups();

                }

            }
        );


        /*=================================================
            ÉVÉNEMENTS DES BOUTONS
        =================================================*/

        if (boutonNouvellePartie) {

            boutonNouvellePartie
                .addEventListener(
                    "click",
                    demanderNouvellePartie
                );

        }


        if (boutonContinuer) {

            boutonContinuer
                .addEventListener(
                    "click",
                    continuerPartie
                );

        }


        if (boutonCharger) {

            boutonCharger
                .addEventListener(
                    "click",
                    chargerSauvegarde
                );

        }


        if (boutonGalerie) {

            boutonGalerie
                .addEventListener(
                    "click",
                    () => {

                        ouvrirPopup(
                            "fenetreGalerie"
                        );

                    }
                );

        }


        if (boutonSucces) {

            boutonSucces
                .addEventListener(
                    "click",
                    () => {

                        ouvrirPopup(
                            "fenetreSucces"
                        );

                    }
                );

        }


        if (boutonParametres) {

            boutonParametres
                .addEventListener(
                    "click",
                    () => {

                        ouvrirPopup(
                            "fenetreParametres"
                        );

                    }
                );

        }


        if (boutonCredits) {

            boutonCredits
                .addEventListener(
                    "click",
                    () => {

                        ouvrirPopup(
                            "fenetreCredits"
                        );

                    }
                );

        }


        if (boutonQuitter) {

            boutonQuitter
                .addEventListener(
                    "click",
                    () => {

                        const confirmation =
                            window.confirm(
                                "Quitter le jeu ?"
                            );

                        if (!confirmation) {

                            return;

                        }


                        /*
                            window.close() ne fonctionne
                            que si la fenêtre a été ouverte
                            par JavaScript.
                        */

                        window.close();


                        setTimeout(
                            () => {

                                window.alert(
                                    "Le navigateur empêche la fermeture automatique. Tu peux fermer cet onglet manuellement."
                                );

                            },
                            150
                        );

                    }
                );

        }


        /*=================================================
            INITIALISATION
        =================================================*/

        actualiserBoutonsSauvegarde();

        initialiserMusique();

    }
);
