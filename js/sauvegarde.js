"use strict";

const sauvegardeManager = {

    cle: "save",

    creerJoueurParDefaut() {

        return {

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

        };

    },

    sauvegarder(donnees) {

        if (!donnees) {
            return;
        }

        const sauvegarde = {

            version: "0.1",

            date:
                new Date().toISOString(),

            chapitre:
                donnees.chapitre ?? 0,

            scene:
                donnees.scene || "intro",

            joueur: {

                ...this.creerJoueurParDefaut(),

                ...(donnees.joueur || {})

            },

            musique:
                donnees.musique || "",

            ambiance:
                donnees.ambiance || ""

        };

        try {

            localStorage.setItem(

                this.cle,

                JSON.stringify(
                    sauvegarde
                )

            );

        }
        catch (erreur) {

            console.error(
                "Erreur de sauvegarde :",
                erreur
            );

        }

    },

    charger() {

        const contenu =
            localStorage.getItem(
                this.cle
            );

        if (!contenu) {

            return null;

        }

        try {

            const sauvegarde =
                JSON.parse(contenu);

            return {

                chapitre:
                    Number.isInteger(
                        sauvegarde.chapitre
                    )
                        ? sauvegarde.chapitre
                        : 0,

                scene:
                    sauvegarde.scene ||
                    "intro",

                joueur: {

                    ...this
                        .creerJoueurParDefaut(),

                    ...(sauvegarde.joueur || {})

                },

                musique:
                    sauvegarde.musique || "",

                ambiance:
                    sauvegarde.ambiance || ""

            };

        }
        catch (erreur) {

            console.error(
                "Sauvegarde invalide :",
                erreur
            );

            this.supprimer();

            return null;

        }

    },

    existe() {

        return localStorage.getItem(
            this.cle
        ) !== null;

    },

    supprimer() {

        localStorage.removeItem(
            this.cle
        );

    }

};