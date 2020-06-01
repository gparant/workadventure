// lib/server.ts
import App from "./src/App";
const PORT = process.env.PORT || 9000;
App.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))