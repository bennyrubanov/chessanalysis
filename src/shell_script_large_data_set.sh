#!/bin/bash

# List of all the database files you want to download
files=("lichess_db_standard_rated_2023-08.pgn.zst" "lichess_db_standard_rated_2023-09.pgn.zst" ...)

# Size of each chunk in bytes (10MB = 10 * 1024 * 1024 bytes) which should yield around 30k games
chunk_size=$((1 * 1024 * 1024))

# Maximum number of chunks to analyze
max_chunks=1

# Counter for the number of chunks analyzed
chunk_counter=0

for file in "${files[@]}"
do
  # Initial byte range
  start=0
  end=$chunk_size

  while :
  do
    # Break the loop if the maximum number of chunks has been analyzed
    if (( chunk_counter >= max_chunks )); then
      break
    fi

    # Download a chunk of the file
    curl -O -r $start-$end https://database.lichess.org/standard/$file

    # Check if the file was downloaded
    if [ ! -f $file ]; then
      echo "File $file not found!"
      break
    fi

    # Decompress the file and save the games to a new file
    zstdcat $file > /Users/bennyrubanov/chessanalysis/data/temp.pgn
    # zstdcat $file | awk -v RS= -v ORS='\n\n' 'NR <= 100' > /path/to/your/project/data/temp.pgn

    # Run your analysis script
    node /Users/bennyrubanov/chessanalysis/src/index.ts

    # Delete the temporary file
    rm /Users/bennyrubanov/chessanalysis/data/temp.pgn

    # Delete the downloaded file
    rm $file

    # Update the byte range for the next chunk
    start=$((start + chunk_size + 1))
    end=$((end + chunk_size))

    # Increment the chunk counter
    ((chunk_counter++))

    # Check if we have reached the end of the file
    if curl --head -r $start- https://database.lichess.org/standard/$file | head -n 1 | grep -q "416"; then
      break
    fi
  done
done