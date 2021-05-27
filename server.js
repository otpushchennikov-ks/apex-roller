const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 3000;

express()
  .use(express.static(path.join(__dirname, 'build')))
  .listen(PORT, () => console.log(`Server is running in port: ${PORT}`));
