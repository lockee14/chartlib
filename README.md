# chartlib
Represent market data as charts on eve-hub.com.
Made with typescript and canvas.

![alt text](https://media.giphy.com/media/TgOHSUdn7xQhcC3COA/source.gif "Logo Title Text 1")

Feel free to use it, clone it, modify it, call it with:

```typescript
initialisation(data: Data[], lang: string)
```

data is an array of object with those field:

```typescript
interface Data {
    date: string;
    average: number;
    highest: number;
    lowest: number;
    volume: number;
    order_count: number;
}
```

lang is a string to set the language, here is a list of the valid one: "de", "en-us", "fr", "ja", "ru", "zh".
