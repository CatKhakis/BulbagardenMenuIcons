import fs from "fs";
import bot from "nodemw";

const folderPath = 'animated_icons/'; // set to 'animated_icons', 'icons', or whatever you'd like it to be.
const category = "Animated_menu_sprites"; //for non-animated icons this can be set to 'Generation_V_menu_sprites'


var client = new bot({
  protocol: "https", // Wikipedia now enforces HTTPS
  server: "archives.bulbagarden.net", // host name of MediaWiki-powered site
  path: "/w", // path to api.php script
});

async function downloadImage(url) {

    const response = await fetch(url, {mode: 'no-cors'})

    let fileName = url.split('/')
    fileName = fileName[fileName.length - 1];

    console.log(fileName);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.createWriteStream(`${folderPath}${fileName}`).write(buffer);
}

client.getPagesInCategory(category, function (err, data) {

    if (err) {
        console.error(err);
        return;
    }

    for (let i = 1; i < data.length; i++) {
        getImageURLByID(data[i].pageid);
    }
});

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