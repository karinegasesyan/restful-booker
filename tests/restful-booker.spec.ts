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

  test("Booking - UpdateBooking", async ({ request }) => {
    const existingBookingId = 1;

    const updatedData = {
      firstname: "James",
      lastname: "Brown",
      totalprice: 111,
      depositpaid: true,
      bookingdates: {
        checkin: "2018-01-01",
        checkout: "2019-01-01",
      },
      additionalneeds: "Breakfast",
    };

    // Get auth token
    const authResponse = await request.post(
      "https://restful-booker.herokuapp.com/auth",
      {
        headers: { "Content-Type": "application/json" },
        data: { username: "admin", password: "password123" },
      },
    );

    const { token } = await authResponse.json();

    // Update booking
    const updateResponse = await request.put(
      `https://restful-booker.herokuapp.com/booking/${existingBookingId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Cookie: `token=${token}`,
        },
        data: updatedData,
      },
    );

    // Assertions
    expect(updateResponse.ok()).toBe(true);
    expect(updateResponse.status()).toBe(200);

    const data = await updateResponse.json();
    expect(data).toEqual(updatedData);

    // or to have similar properties
    expect(data).toHaveProperty("firstname", "James");
    expect(data).toHaveProperty("lastname", "Brown");
    expect(data).toHaveProperty("totalprice", 111);
    expect(data).toHaveProperty("depositpaid", true);
    expect(data).toHaveProperty("bookingdates");
    expect(data.bookingdates).toHaveProperty("checkin", "2018-01-01");
    expect(data.bookingdates).toHaveProperty("checkout", "2019-01-01");
    expect(data).toHaveProperty("additionalneeds", "Breakfast");
  });

  test("Booking - PartialUpdateBooking", async ({ request }) => {
    const existingBookingId = 1;
    const updatedData = {
      firstname: "James",
      lastname: "Brown",
    };

    // Get auth token
    const authResponse = await request.post(
      "https://restful-booker.herokuapp.com/auth",
      {
        headers: { "Content-Type": "application/json" },
        data: { username: "admin", password: "password123" },
      },
    );

    const { token } = await authResponse.json();

    // Update booking (Partial)
    const updateResponse = await request.patch(
      `https://restful-booker.herokuapp.com/booking/${existingBookingId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Cookie: `token=${token}`,
        },
        data: updatedData,
      },
    );
    expect(updateResponse.ok()).toBe(true);
    expect(updateResponse.status()).toBe(200);

    const data = await updateResponse.json();

    //updated fields
    expect(data).toHaveProperty("firstname", "James");
    expect(data).toHaveProperty("lastname", "Brown");
  });

  test("Booking - DeleteBooking", async ({ request }) => {
    const createBooking = {
      firstname: "Jim",
      lastname: "Brown",
      totalprice: 111,
      depositpaid: true,
      bookingdates: { checkin: "2026-01-01", checkout: "2026-02-01" },
      additionalneeds: "Breakfast",
    };

    // Create a booking
    const createResponse = await request.post(
      "https://restful-booker.herokuapp.com/booking",
      {
        headers: { "Content-Type": "application/json" },
        data: createBooking,
      },
    );
    const { bookingid } = await createResponse.json();

    // Get auth token
    const authResponse = await request.post(
      "https://restful-booker.herokuapp.com/auth",
      {
        headers: { "Content-Type": "application/json" },
        data: { username: "admin", password: "password123" },
      },
    );
    const { token } = await authResponse.json();

    // Delete the booking
    const deleteResponse = await request.delete(
      `https://restful-booker.herokuapp.com/booking/${bookingid}`,
      {
        headers: {
          "Content-Type": "application/json",
          Cookie: `token=${token}`,
        },
      },
    );

    expect(deleteResponse.ok()).toBe(true);
    expect(deleteResponse.status()).toBe(201);
  });

  test("Ping - HealthCheck", async ({ request }) => {
    const response = await request.get(
      "https://restful-booker.herokuapp.com/ping",
    );
    expect(response.ok()).toBe(true);
    expect(response.status()).toBe(201);
  });
});
