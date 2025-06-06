const BUTTONS = {
    SEARCH: "🔍 Search for partner".trim().normalize('NFC'),
    STOP_SEARCH: "🛑 Stop searching".trim().normalize('NFC'),
    MALE: "👦 Male".trim().normalize('NFC'),
    FEMALE: "👧 Female".trim().normalize('NFC'),
};

const isValidAction = (action) => {
    return Object.values(BUTTONS).includes(action);
}

const getActionCommand = (action) => {
    action = action.trim().normalize('NFC');
    if (isValidAction(action)) {
        return Object.keys(BUTTONS).find(key => BUTTONS[key] === action).toLocaleLowerCase();
    }
    return '';
}

export { BUTTONS, isValidAction, getActionCommand };
