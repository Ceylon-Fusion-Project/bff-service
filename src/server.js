const app = require('./app2');
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`BFF service is running on port ${PORT}`);
});

