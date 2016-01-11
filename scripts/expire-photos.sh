PHOTOS_DIR=$1;
cd $PHOTOS_DIR && find * -type f -cmin +60 -exec rm {} \;
