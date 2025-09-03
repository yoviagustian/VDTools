#!/bin/bash
#touch "/tmp/log_tmp.txt"
#chmod u+rw g+rw o+rw "/tmp/log_tmp.txt"

ROOT_PATH="/home/srin/VDTools/data"
HOST_IP_ADDRESS=$(ip address | sed -En 's/.*inet (addr:)?(([0-9]*\.){3}[0-9]*).*/\2/p' | grep 107.102)
CHIPSET_NAME=""
IS_NIU=1
IS_USB=1
IS_DEFAULT_PARTITION=1
IS_DEV_PARTITION=0
IS_CUSTOM_CHIPSET=0
IS_CHANGE_EMTOKEN=0

log() {
    echo -e $1
}

open_http_server() {
    RANDOM_PORT=$((RANDOM * (8999-8000)/32767 + 8000))
    if [[ $IS_NIU == 1 ]]; then
        log "\nServing: $NIU_PATH"
        python3 -u -m http.server $RANDOM_PORT -d $NIU_PATH -b $HOST_IP_ADDRESS
    fi
}

print_help_message() {
    echo -e "Usage: downloadImage.sh [OPTIONS] [URL] \n"
    echo "Available options:"
    echo "   -a      Create image folder for both NIU and USB (default)"
    echo "   -n      Create image folder for NIU use only"
    echo "   -u      Create image folder for USB use only"
    echo "   -p      Use the non-default partition file (non-dev, ex: partition_16G.txt)"
    echo "   -d      Use dev partition file (ex: partition_8G_dev.txt)"
    echo "   -e      Change EMTOKEN to NONE in all partition files (use if getting error: SERET_ERR__PARSE_ERROR)"
    echo "   -i      Use custom chipset name mode"
    echo "   -h      Display help page"
    echo
    echo "Input url include with .tar.gz, example: downloadImage.sh http://.../image_to_download.tar.gz"
    echo "Available images to be used: KantSU2e, NikeL, OscarP, OscarS, PontusM, PontusML, RoseL, RoseM, RoseP, RoseSF"
}

extract_file() {
    TARGET_PATH=$1
    if [[ -d "$DOWNLOAD_PATH/$FILE_NAME" ]]; then
        log "Cleaning previously extracted files ..."
        rm -rf "$DOWNLOAD_PATH/$FILE_NAME"
        log "Cleaning done."
    fi
    
    mkdir -pv "$DOWNLOAD_PATH/$FILE_NAME"
    [[ $IS_USB == 1 ]] && mkdir -pv "$DOWNLOAD_PATH/$FILE_NAME/USB"
    mkdir -pv "$TARGET_PATH"
    
    log "\nExtracting files:"
    tar -xvf "$DOWNLOAD_PATH/$FILE_NAME.tar.gz" -C "$TARGET_PATH" --checkpoint=10000 --checkpoint-action=dot
    log "\nExtracted to: $TARGET_PATH"
}

modify_file() {
    FILE_PATH=$1
    touch "$FILE_PATH/0_$FILE_NAME"
    log "\nModifying:"
    
    if [[ -f "$FILE_PATH/do_not_use.img" ]]; then
        log "do_not_use.img >> data.img"
        mv "$FILE_PATH/do_not_use.img" "$FILE_PATH/data.img"
    elif [[ -f "$FILE_PATH/data.img" ]]; then
        log "data.img already exists"
    else
        log ".img file doesn't exist"
    fi
    
    if [[ $IS_DEFAULT_PARTITION == 1 && $IS_DEV_PARTITION == 0 ]]; then
        log "using default partition.txt"
    else
        if compgen -G "$FILE_PATH/partition_*.txt" > /dev/null; then
            if [[ $IS_DEV_PARTITION == 1 ]]; then
                if compgen -G "$FILE_PATH/partition_*dev*.txt" > /dev/null; then
                    PARTITION_FILE=$(ls $FILE_PATH/partition_*dev*.txt)
                else
                    log "dev partition doesn't exist."
                    log "using default partition.txt"
                fi
            else
                log "test"
                if compgen -g "$FILE_PATH/partition_*G.txt" > /dev/null; then
                    PARTITION_FILE=$(ls $FILE_PATH/partition_*G.txt)
                    log "test2"
                fi
                log "test3"
            fi
            
            if [[ $PARTITION_FILE != "" ]]; then
                log "partition.txt >> partition-OLD.txt"
                mv "$FILE_PATH/partition.txt" "$FILE_PATH/partition-OLD.txt"
                log "${PARTITION_FILE##*/} >> partition.txt"
                mv "$PARTITION_FILE" "$FILE_PATH/partition.txt"
            else
                log "using default partition.txt"
            fi
        else
            log "using default partition.txt"
        fi
    fi
    
    if [[ $IS_USB == 1 ]]; then
        log "\nFor USB:"
        mkdir -pv "$DOWNLOAD_PATH/$FILE_NAME/USB"
        mkdir -pv "$USB_PATH"
        [[ $IS_NIU == 1 ]] && cp -rT $NIU_PATH $USB_PATH
        log "Modifying USB/$USB_FOLDER_NAME/dtb.bin >> USB/$USB_FOLDER_NAME/dtb_ro.bin"
        mv "$USB_PATH/dtb.bin" "$USB_PATH/dtb_ro.bin"
        log "Modifying USB/$USB_FOLDER_NAME/dtb_RW.bin >> USB/$USB_FOLDER_NAME/dtb.bin"
        mv "$USB_PATH/dtb_RW.bin" "$USB_PATH/dtb.bin"
    fi
    
    if [[ $IS_CHANGE_EMTOKEN == 1 ]]; then
        log "Modifying all partition*.txt: EMTOKEN >> NONE"
        sed -i.old "s/\tEMTOKEN\t/\tNONE\t/" $FILE_PATH/partition*.txt
        [[ $IS_USB == 1 ]] && sed -i.old "s/\tEMTOKEN\t/\tNONE\t/" $USB_PATH/partition*.txt
    fi
}

{
while getopts "anupedhi" OPT 2>/dev/null; do
    case $OPT in
        h)
            print_help_message
            exit 0
            ;;
        a)
            IS_NIU=1
            IS_USB=1
            ;;
        n)  
            IS_USB=0
            # log "Using NIU only option"
            ;;
        u)
            IS_NIU=0
            # log "Using USB only option"
            ;;
        p)
            log "Using non-default partition"
            IS_DEFAULT_PARTITION=0
            IS_DEV_PARTITION=0
            ;;
        e)  
            log "Changing EMTOKEN to NONE. Used if getting error: SERET_ERR__PARSE_ERROR"
            IS_CHANGE_EMTOKEN=1
            ;;
        d)
            log "Using dev partition"
            IS_DEFAULT_PARTITION=0
            IS_DEV_PARTITION=1
            ;;
        i)
            log "Using custom chipset name"
            IS_CUSTOM_CHIPSET=1
            ;;
        ?) 
            log "Invalid option."
            print_help_message
            exit 0
            ;;
    esac
done 
shift $((OPTIND-1))


if [[ $IS_NIU == 0 && $IS_USB == 1 ]]; then log "Using USB only option";
elif [[ $IS_NIU == 1 && $IS_USB == 0 ]]; then log "Using NIU only option";
else log "Using NIU and USB option"; fi


IMAGE_URL=$1
if [[ "$IMAGE_URL" == *"priv"* ]]; then YEAR="priv";
elif [[ "$IMAGE_URL" == *"current"* ]]; then YEAR=$(date +%Y);
else 
    YEAR=$(echo "$IMAGE_URL" | grep -oP '(?<=/)[0-9]{4}(?=/)')
    if [[ $YEAR == "" ]]
    then 
         YEAR=$(date +%Y)
    fi
fi
mkdir -pv "$ROOT_PATH/years/$YEAR"

echo "year:$YEAR"
FILE_NAME=${IMAGE_URL##*/}
FILE_NAME=${FILE_NAME%.tar.gz*}
 
USB_FOLDER_NAME=""
if [[ $IS_CUSTOM_CHIPSET == 1 ]]
then    
    read -p "Input chipset name: " CHIPSET_NAME
    read -p "Input output folder name (ex: updateXX): " USB_FOLDER_NAME
else
    if [[ "$FILE_NAME" == *"T-KSU2E"* ]]; then CHIPSET_NAME="KantSU2e"; USB_FOLDER_NAME="updateSU2E"; fi
    if [[ "$FILE_NAME" == *"T-NKL"* ]]; then CHIPSET_NAME="NikeL"; USB_FOLDER_NAME="updateNL"; fi
    if [[ "$FILE_NAME" == *"T-OSCP"* ]]; then CHIPSET_NAME="OscarP"; USB_FOLDER_NAME="updateOP"; fi
    if [[ "$FILE_NAME" == *"T-OSCS"* ]]; then CHIPSET_NAME="OscarS"; USB_FOLDER_NAME="updateOS"; fi
    if [[ "$FILE_NAME" == *"T-PTM"* ]]; then CHIPSET_NAME="PontusM"; USB_FOLDER_NAME="updatePM";
        if [[ $IS_DEFAULT_PARTITION == 1 ]]
        then  
            log "PontusM image. Using dev partition.."
            IS_DEV_PARTITION=1
            IS_DEFAULT_PARTITION=0
        fi
    fi
    if [[ "$FILE_NAME" == *"T-PMLP"* ]]; then CHIPSET_NAME="PontusML"; USB_FOLDER_NAME="updatePMLP"; fi
    if [[ "$FILE_NAME" == *"T-RSL"* ]]; then CHIPSET_NAME="RoseL"; USB_FOLDER_NAME="updateRSL"; fi
    if [[ "$FILE_NAME" == *"T-RSM"* ]]; then CHIPSET_NAME="RoseM"; USB_FOLDER_NAME="updateRM"; fi
    if [[ "$FILE_NAME" == *"T-RSP"* ]]; then CHIPSET_NAME="RoseP"; USB_FOLDER_NAME="updateRP"; fi
    if [[ "$FILE_NAME" == *"T-RSSF"* ]]; then CHIPSET_NAME="RoseSF"; USB_FOLDER_NAME="updateRSFM"; fi

    if [[ $CHIPSET_NAME == "" || $USB_FOLDER_NAME == "" ]]
    then
        log "No chipset found. Returning..."
        exit 1
    fi
fi

if [ -z "$YEAR" ]; then
  echo "Could not extract year from filename: $FILE_NAME"
  exit 1
fi


################ Downloading Files ################
DOWNLOAD_PATH="$ROOT_PATH/$CHIPSET_NAME"
mkdir -pv "$DOWNLOAD_PATH"

log "\nDownloading $FILE_NAME.tar.gz to $DOWNLOAD_PATH ..."
axel -n 100 -o $DOWNLOAD_PATH $IMAGE_URL --no-clobber -q #-a
log "Downloaded file: $FILE_NAME.tar.gz\nFile Path: $DOWNLOAD_PATH\n"


################ Extracting & Modifying Files ################
NIU_PATH="$DOWNLOAD_PATH/$FILE_NAME/NIU"
USB_PATH="$DOWNLOAD_PATH/$FILE_NAME/USB/$USB_FOLDER_NAME"
HOSTED_PATH="$ROOT_PATH/years/$YEAR/$CHIPSET_NAME/$FILE_NAME"

if [[ $IS_NIU == 1  ]]
then
    extract_file $NIU_PATH
    modify_file $NIU_PATH
else    
    extract_file $USB_PATH
    modify_file $USB_PATH
fi

mkdir -pv "$HOSTED_PATH"
cp -rT "$NIU_PATH" "$HOSTED_PATH"


# log "\n===================================================================================================================================="
# log "Files are ready to be installed! :)"
# if [[ $IS_NIU == 1 ]]
# then 
#     log "Path for NIU: $NIU_PATH  [remember to run 'NIU.sh rw' in SERET]"
# fi

# if [[ $IS_USB == 1 ]]
# then
#     log "Path for USB: $USB_PATH"
#     log "\n[optional for USB] copy command in Windows cmd:"
#     log "if not exist Downloads\\images mkdir Downloads\\images"
#     log "if exist Downloads\\images\\$USB_FOLDER_NAME rd /s /q Downloads\\images\\$USB_FOLDER_NAME"
#     log "scp -r srin@$HOST_IP_ADDRESS:$USB_PATH Downloads\\images\\$USB_FOLDER_NAME"
# fi
# log "===================================================================================================================================="

sleep 1

cp "/tmp/log_tmp.txt" "$DOWNLOAD_PATH/$FILE_NAME/log.txt"

#open_http_server

echo "http://107.102.187.30:8000/$YEAR/$CHIPSET_NAME/$FILE_NAME"
exit 0

} 2>&1 | tee "/tmp/log_tmp.txt" -p --output-error='exit'