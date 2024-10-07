# Satisfactory Image to .CBP Converter

A tool for the game Satisfactory which can convert an input image into a `*.cbp` file. A `*.cbp` file can be used by Satisfactory-Calculator to import as a "megablueprint" and then used in your satisfactory world.
Renders each pixel as a 1m x 1m Painted Beam, preserving the input color.

Usage:
```
npm install
node satisimg.mjs <path-to-file> [--out-path=output.cbp]
```

For additional documentation on usage, run `node satisimg.mjs` without arguments and detailed usage options will be displayed.

Example of straightforward usage:
```
node satisimg.mjs input.bmp
```

The above will take the image in `input.bmp`, process every pixel except the transparent pixels, and output an `output.cbp` file. You can use https://satisfactory-calculator.com/ to load your save, make a foundation, import the `output.cbp` file, right click the foundation, and then apply the megablueprint overtop of it. From there, you can optionally move or rotate it further to your liking. Once you export the save and import it into Satisfactory, the image made of beams will be visible in-game.

Example of custom file name usage:
```
node satisimg.mjs custom-img.bmp --out-path=custom-output-filename.cbp
```

Example input:
![Input](https://github.com/sigseg1v/satisfactory-image-processor/blob/main/examples/example-input-screenshot.png?raw=true)

Above example input rendered in game:
![Rendered In Game](https://github.com/sigseg1v/satisfactory-image-processor/blob/main/examples/example-ingame.png?raw=true)