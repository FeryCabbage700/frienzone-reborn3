"use strict";

const chapitresManager = {

    chapitres: [],

    fichiers: [
        "chapitres/chapitre1.json",
        "chapitres/chapitre2.json",
        "chapitres/chapitre3.json",
        "chapitres/chapitre4.json",
        "chapitres/chapitre5.json",
        "chapitres/chapitre6.json",
        "chapitre/chapitre7.json",
        "chapitre/chapitre8.json",
        "chapitre/chapitre9.json",
        "chapitre/chapiree10.json",
        "chapitre/chapitre11.json",
        "chapitre/chapitre12.json",
        "chapitre/chapitre13.jsonS"
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
