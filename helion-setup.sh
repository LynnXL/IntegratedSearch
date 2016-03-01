#!/bin/bash
#echo "This scripts does Helion estup related to file system"
FS=$STACKATO_FILESYSTEM

echo "Create folders in the shared filesystem"
mkdir -p $FS/uploads

echo "Symlink to JSON payload and mobile apps file"
ln -s $FS/uploads public/uploads
