
if typeof document is 'undefined'
  # We are in a worker thread.
  worker()
else
  # We are in the main thread.
  main()
