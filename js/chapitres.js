"use strict";

const chapitresManager = {

    chapitres: [],

    fichiers: [
        "chapitres/chapitre1.json",
        "chapitres/chapitre2.json",
        "chapitres/chapitre3.json",
        "chapitres/chapitre4.json",
        "chapitres/chapitre5.json"
    ],

    async charger() {

        this.chapitres = [];

        for (const fichier of this.fichiers) {

            try {

                const reponse = await fetch(fichier);

                if (!reponse.ok) {

                    console.warn(
                        "Chapitre non trouvé :",
                        fichier
                    );

                    continue;

                }

                const chapitre =
                    await reponse.json();

                this.chapitres.push(
                    chapitre
                );

            }
            catch (erreur) {

                console.error(
                    "Erreur de chargement :",
                    fichier,
                    erreur
                );

            }

        }

    },

    obtenir(index) {

        return this.chapitres[index];

    },

    nombre() {

        return this.chapitres.length;

    }

};