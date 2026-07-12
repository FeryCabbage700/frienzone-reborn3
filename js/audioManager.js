/*=====================================================
    FRIENDZONÉ REBORN
    Audio Manager V2
=====================================================*/

const audioManager = {

    musique: new Audio(),
    ambiance: new Audio(),

    musiqueActuelle: "",
    ambianceActuelle: "",

    volumeMusique: 0.40,
    volumeAmbiance: 0.25,
    volumeEffets: 0.70,



    initialiser() {

        this.musique.loop = true;
        this.ambiance.loop = true;

        this.musique.volume = this.volumeMusique;
        this.ambiance.volume = this.volumeAmbiance;

    },



    //-----------------------------------
    // MUSIQUE
    //-----------------------------------

    jouerMusique(nom) {

        if (this.musiqueActuelle === nom)
            return;

        this.musique.pause();

        this.musique.src = "audio/" + nom + ".mp3";

        this.musique.currentTime = 0;

        this.musique.volume = this.volumeMusique;

        this.musique.play().catch(() => { });

        this.musiqueActuelle = nom;

    },



    //-----------------------------------
    // FADE IN
    //-----------------------------------

    fadeIn(nom, duree = 1200) {

        if (this.musiqueActuelle === nom)
            return;

        this.musique.pause();

        this.musique.src = "audio/" + nom + ".mp3";

        this.musique.currentTime = 0;

        this.musique.volume = 0;

        this.musique.play().catch(() => { });

        this.musiqueActuelle = nom;

        let volume = 0;

        const pas = this.volumeMusique / (duree / 40);

        const fade = setInterval(() => {

            volume += pas;

            if (volume >= this.volumeMusique) {

                volume = this.volumeMusique;

                clearInterval(fade);

            }

            this.musique.volume = volume;

        }, 40);

    },



    //-----------------------------------
    // FADE OUT
    //-----------------------------------

    fadeOut(duree = 1200) {

        let volume = this.musique.volume;

        const pas = volume / (duree / 40);

        const fade = setInterval(() => {

            volume -= pas;

            if (volume <= 0) {

                volume = 0;

                clearInterval(fade);

                this.musique.pause();

            }

            this.musique.volume = volume;

        }, 40);

    },



    //-----------------------------------
    // CHANGER DE MUSIQUE
    //-----------------------------------

    changerMusique(nom) {

        if (this.musiqueActuelle === nom)
            return;

        this.fadeOut(800);

        setTimeout(() => {

            this.fadeIn(nom, 800);

        }, 800);

    },



    //-----------------------------------
    // STOP
    //-----------------------------------

    arreterMusique() {

        this.musique.pause();

        this.musique.currentTime = 0;

        this.musiqueActuelle = "";

    },



    //-----------------------------------
    // AMBIANCE
    //-----------------------------------

    jouerAmbiance(nom) {

        if (this.ambianceActuelle === nom)
            return;

        this.ambiance.pause();

        this.ambiance.src = "audio/ambiance/" + nom + ".mp3";

        this.ambiance.currentTime = 0;

        this.ambiance.volume = this.volumeAmbiance;

        this.ambiance.play().catch(() => { });

        this.ambianceActuelle = nom;

    },



    //-----------------------------------
    // STOP AMBIANCE
    //-----------------------------------

    arreterAmbiance() {

        this.ambiance.pause();

        this.ambiance.currentTime = 0;

        this.ambianceActuelle = "";

    },



    //-----------------------------------
    // SONS
    //-----------------------------------

    jouerSon(nom, volume = this.volumeEffets) {

        const son = new Audio("audio/sfx/" + nom + ".mp3");

        son.volume = volume;

        son.play().catch(() => { });

    },



    //-----------------------------------
    // PAUSE
    //-----------------------------------

    pause() {

        this.musique.pause();

        this.ambiance.pause();

    },



    //-----------------------------------
    // REPRISE
    //-----------------------------------

    reprendre() {

        this.musique.play().catch(() => { });

        this.ambiance.play().catch(() => { });

    },



    //-----------------------------------
    // VOLUMES
    //-----------------------------------

    setVolumeMusique(volume) {

        this.volumeMusique = volume;

        this.musique.volume = volume;

    },



    setVolumeAmbiance(volume) {

        this.volumeAmbiance = volume;

        this.ambiance.volume = volume;

    },



    setVolumeEffets(volume) {

        this.volumeEffets = volume;

    }

};



audioManager.initialiser();