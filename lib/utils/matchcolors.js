function rounded(num) {
    return Math.round(num);
}

function get_dec(hex) {
    if (hex == 'F') {
        return 15;
    }
    if (hex == 'E') {
        return 14;
    }
    if (hex == 'D') {
        return 13;
    }
    if (hex == 'C') {
        return 12;
    }
    if (hex == 'B') {
        return 11;
    }
    if (hex == 'A') {
        return 10;
    }

    return hex;
}

function hex_to_dec(c, start) {
    var c1 = get_dec(c.substring(start, start + 1));
    var c2 = get_dec(c.substring(start + 1, start + 2));
    return (c1 * 16) + c2 * 1;
}


function match_colors(color1, color2) {
    
    var c1, c2;

    c1 = color1.replace('#', '').toUpperCase();
    c2 = color2.replace('#', '').toUpperCase();

    var r1, g1, b1, r2, g2, b2;


    r1 = hex_to_dec(c1, 0);
    g1 = hex_to_dec(c1, 2);
    b1 = hex_to_dec(c1, 4);
    r2 = hex_to_dec(c2, 0);
    g2 = hex_to_dec(c2, 2);
    b2 = hex_to_dec(c2, 4);


    var diff1, diff2, diff3;


    diff1 = Math.abs(r1 - r2);
    diff2 = Math.abs(g1 - g2);
    diff3 = Math.abs(b1 - b2);


    var result = rounded(100 - (diff1 + diff2 + diff3) / (3 * 255) * 100);
  
    return result;
}