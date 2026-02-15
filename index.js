import fs from "fs";
import bot from "nodemw";

import { lookup } from "./lookup.js"

const modes = {

    'gen-v-icons': {
        'path': 'generation-v/icons/',
        'searchCategory': 'Generation_V_menu_sprites',
        'indexStart': 0,
        'indexStop': 7,
        'listStart': 1,
    },
    'gen-v-animated-icons': {
        'path': 'generation-v/icons/animated/',
        'searchCategory': 'Animated_menu_sprites',
        'indexStart': 3,
        'indexStop': 6,
        'listStart': 0,
    },
    'gen-vi-icons': {
        'path': 'generation-vi/icons/',
        'searchCategory': 'Generation_VI_menu_sprites',
        'indexStart': 0,
        'indexStop': 7,
        'listStart': 0,
    },
};

// --- change variable here to set which mode the script is run with --- //
const setMode = 'gen-vi-icons';


// Set up MediaWiki API

var client = new bot({
  protocol: "https", // Wikipedia now enforces HTTPS
  server: "archives.bulbagarden.net", // host name of MediaWiki-powered site
  path: "/w", // path to api.php script
});


//Retrieves list of Pokemon sprites in a given category then iterates over the list.

client.getPagesInCategory(modes[setMode].searchCategory, function (err, data) {

    if (err) {
        console.error(err);
        return;
    }

    //Start index differs by category as some have a link to another page as their first list item.
    for (let i = modes[setMode].listStart; i < data.length; i++) {
        getImageURLByID(data[i].pageid);
    }
});

// Queries the API for the image URL

async function getImageURLByID(id) {

    const params = {action: "query",prop: "pageimages",pageids: id};

    client.api.call(params, function (err, data) {

        if (err) {
            console.error(err);
            return;
        }

        downloadImage(data.pages[id].thumbnail.source);
    });
}

//Downloads image in specific set folder

async function downloadImage(url) {

    const response = await fetch(url, {mode: 'no-cors'})
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    //Sets the filepath and name based on the mode
    let fileName = url.split('/')
    fileName = fileName[fileName.length - 1];
    const index = fileName.substring(modes[setMode].indexStart, fileName.length - modes[setMode].indexStop);

    //Filename is determined by the lookup table if there is an entry for the given dex number.
    if (lookup[index]) {

        //Lookup derived filename requires a custom path
        console.log(`${modes[setMode].path}${lookup[index]}.png`)
        fs.createWriteStream(`${modes[setMode].path}${lookup[index]}.png`).write(buffer);

        //Some sprites are duplicated to have the variant text and standard as a fallback
        //e.g. 521 -> 521 & 521-male
        if (index.length === 3) {

            fs.createWriteStream(`${modes[setMode].path}${parseInt(index)}.png`).write(buffer);
            console.log(`${modes[setMode].path}${parseInt(index)}.png`)
        }
    } else {

        fs.createWriteStream(`${modes[setMode].path}${parseInt(index)}.png`).write(buffer);
        console.log(`${modes[setMode].path}${parseInt(index)}.png`)
    }
}
