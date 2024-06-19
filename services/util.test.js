let { isValidEmail,
    isValidPassword,
    isValidEmailConfirmation,
    isValidPasswordConfirmation,
    isValidUsername } = require("./util")

// Email validation test
test('Email validation test', () => {
    expect(isValidEmail("123@icloud.com")).toBe(true)
    expect(isValidEmail("123icloud.com")).toBe(false)
})

// Password validation test
test('Password validation test', () => {
    expect(isValidPassword("12345678")).toBe(true)
    expect(isValidPassword("1234")).toBe(false)
})

// Email confirmation test
describe('Email match validation', () => {
    test('emails match', () => {
        expect(isValidEmailConfirmation('test@example.com', 'test@example.com')).toBe(true);
    });

    test('emails do not match', () => {
        expect(isValidEmailConfirmation('test@example.com', 'different@example.com')).toBe(false);
    });

    test('empty emails should match', () => {
        expect(isValidEmailConfirmation('', '')).toBe(true);
    });

    test('undefined emails should match', () => {
        expect(isValidEmailConfirmation(undefined, undefined)).toBe(true);
    });

    test('null emails should match', () => {
        expect(isValidEmailConfirmation(null, null)).toBe(true);
    });

    test('string and null should not match', () => {
        expect(isValidEmailConfirmation('test@example.com', null)).toBe(false);
    });

});

// Password confirmation test
describe('Passwords match validation', () => {
    test('passwords match', () => {
        expect(isValidPasswordConfirmation('password123', 'password123')).toBe(true);
    });

    test('passwords do not match', () => {
        expect(isValidPasswordConfirmation('password123', 'differentPassword123')).toBe(false);
    });

    test('empty passwords should match', () => {
        expect(isValidPasswordConfirmation('', '')).toBe(true);
    });

    test('undefined passwords should match', () => {
        expect(isValidPasswordConfirmation(undefined, undefined)).toBe(true);
    });

    test('null passwords should match', () => {
        expect(isValidPasswordConfirmation(null, null)).toBe(true);
    });

    test('string and null should not match', () => {
        expect(isValidPasswordConfirmation('password123', null)).toBe(false);
    });
});



describe('Username validation', () => {
    test('should accept valid username', () => {
        const username = 'valid-user_123';
        expect(isValidUsername(username)).toBe(true);
    });

    test('should reject username with special characters', () => {
        const username = 'invalid#user!';
        expect(isValidUsername(username)).toBe(false);
    });

    test('should reject username shorter than 3 characters', () => {
        const username = 'ab';
        expect(isValidUsername(username)).toBe(false);
    });

    test('should reject username longer than 20 characters', () => {
        const username = 'a'.repeat(21);
        expect(isValidUsername(username)).toBe(false);
    });
});