import { test, expect } from "@playwright/test";
import { request } from "node:http";

test.describe("API documentation for the playground API restful-booker", () => {
  test("Auth POST - CreateToken", async ({ request }) => {
    const response = await request.post(
      "https://restful-booker.herokuapp.com/auth",
      {
        headers: { "Content-Type": "application/json" },
        data: { username: "admin", password: "password123" },
      },
    );

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("token");
  });

  test("Booking - GetBookingIds", async ({ request }) => {
    const response = await request.get(
      "https://restful-booker.herokuapp.com/booking",
    );

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    for (let el of data) {
      expect(el).toHaveProperty("bookingid");
    }
  });

  test("Booking - GetBookingIds Filter by name", async ({ request }) => {
    const response = await request.get(
      "https://restful-booker.herokuapp.com/booking?firstname=sally&lastname=brown",
    );
    expect(response.ok()).toBe(true);
    expect(response.status()).toBe(200);

    const data = await response.json();
    for (let el of data) {
      expect(el).toHaveProperty(" bookingid");
    }
  });

  test("Booking - GetBookingIds Filter by checkin/checkout date", async ({
    request,
  }) => {
    const checkin = "2014-03-13";
    const checkout = "2014-05-21";

    const response = await request.get(
      `https://restful-booker.herokuapp.com/booking?checkin=${checkin}&checkout=${checkout}`,
    );

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();

    for (let elem of data) {
      expect(elem).toHaveProperty("bookingid");
    }
  });

  test("Booking - GetBooking", async ({ request }) => {
    const expectedBooking = {
      firstname: "Sally",
      lastname: "Brown",
      totalprice: 111,
      depositpaid: true,
      bookingdates: {
        checkin: "2013-02-23",
        checkout: "2014-10-23",
      },
      additionalneeds: "Breakfast",
    };

    const response = await request.post(
      "https://restful-booker.herokuapp.com/booking",
      {
        headers: { "Content-Type": "application/json" },
        data: expectedBooking,
      },
    );
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();

    //Create data for id 1
    const bookingId = data.bookingid;

    // Get the booking by ID
    const getResponse = await request.get(
      `https://restful-booker.herokuapp.com/booking/${bookingId}`,
      {
        headers: { Accept: "application/json" },
      },
    );
    expect(getResponse.ok()).toBeTruthy();
    expect(getResponse.status()).toBe(200);

    const getData = await getResponse.json();

    expect(getData).toEqual(expectedBooking);

    //or expect to have the same property as in expected data
    expect(getData).toHaveProperty("firstname", "Sally");
    expect(getData).toHaveProperty("lastname", "Brown");
    expect(getData).toHaveProperty("totalprice", 111);
    expect(getData).toHaveProperty("depositpaid", true);
    expect(getData).toHaveProperty("bookingdates");
    expect(getData.bookingdates).toHaveProperty("checkin", "2013-02-23");
    expect(getData.bookingdates).toHaveProperty("checkout", "2014-10-23");
    expect(getData).toHaveProperty("additionalneeds", "Breakfast");
  });

  test("Booking - POST:CreateBooking", async ({ request }) => {
    const bookingData = {
      firstname: "Jim",
      lastname: "Brown",
      totalprice: 111,
      depositpaid: true,
      bookingdates: {
        checkin: "2018-01-01",
        checkout: "2019-01-01",
      },
      additionalneeds: "Breakfast",
    };

    const response = await request.post(
      "https://restful-booker.herokuapp.com/booking",
      {
        headers: {
          "Content-Type": "application/json",
        },
        data: bookingData,
      },
    );

    expect(response.ok()).toBe(true);
    expect(response.status()).toBe(200);

    const data = await response.json();

    expect(data).toHaveProperty("bookingid");
    expect(data).toHaveProperty("booking");
    expect(data.booking).toEqual(bookingData);

    // or to have similar properties
    expect(data.booking).toHaveProperty("firstname", "Jim");
    expect(data.booking).toHaveProperty("lastname", "Brown");
    expect(data.booking).toHaveProperty("totalprice", 111);
    expect(data.booking).toHaveProperty("depositpaid", true);
    expect(data.booking).toHaveProperty("bookingdates");
    expect(data.booking.bookingdates).toHaveProperty("checkin", "2018-01-01");
    expect(data.booking.bookingdates).toHaveProperty("checkout", "2019-01-01");
    expect(data.booking).toHaveProperty("additionalneeds", "Breakfast");
  });
});
