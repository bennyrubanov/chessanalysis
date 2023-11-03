#!/bin/bash

# List of all the database files you want to download
files=("lichess_db_standard_rated_2023-08.pgn.zst" "lichess_db_standard_rated_2023-09.pgn.zst" ...)

# Size of each chunk in bytes (10MB = 10 * 1024 * 1024 bytes) which should yield around 30k games
chunk_size=$((10 * 1024))

# Maximum number of chunks to analyze
max_chunks=3

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

    # Download a chunk of the file and decompress it
    curl -r $start-$end https://database.lichess.org/standard/$file | zstd -d -c > /Users/bennyrubanov/chessanalysis/data/temp.pgn
    echo "Chunk of size $(($chunk_size / 1024 / 1024)) MB of $file downloaded and decompressed."

    # Run your analysis script
    node /Users/bennyrubanov/chessanalysis/dist/src/index.js
    echo "Analysis script run on chunk of $file."

    # Delete the temporary file
    rm /Users/bennyrubanov/chessanalysis/data/temp.pgn
    echo "Temporary file deleted."

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