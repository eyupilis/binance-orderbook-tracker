const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

// Statik dosyaları serve et
app.use(express.static(__dirname));

// Tüm rotaları index.html'e yönlendir
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
