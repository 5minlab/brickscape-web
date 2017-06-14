magick sc01.png -resize 720 resize_01.jpg

magick sc02.png -resize 480 resize_02.jpg
magick sc03.png -resize 480 resize_03.jpg
magick sc04.png -resize 480 resize_04.jpg
magick sc05.png -resize 480 resize_05.jpg

magick convert sc01.png resize_large_01.jpg
magick convert sc02.png resize_large_02.jpg
magick convert sc03.png resize_large_03.jpg
magick convert sc04.png resize_large_04.jpg
magick convert sc05.png resize_large_05.jpg
