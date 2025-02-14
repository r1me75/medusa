import { OrderChangeEvent } from "../../../../types"
import { ChangeActionType, calculateOrderChange } from "../../../../utils"

describe("Order Exchange - Actions", function () {
  const originalOrder = {
    items: [
      {
        id: "1",
        quantity: 1,
        unit_price: 10,

        fulfilled_quantity: 1,
        return_requested_quantity: 0,
        return_received_quantity: 0,
        return_dismissed_quantity: 0,
        written_off_quantity: 0,
      },
      {
        id: "2",
        quantity: 2,
        unit_price: 100,

        fulfilled_quantity: 1,
        return_requested_quantity: 0,
        return_received_quantity: 0,
        return_dismissed_quantity: 0,
        written_off_quantity: 0,
      },
      {
        id: "3",
        quantity: 3,
        unit_price: 20,

        fulfilled_quantity: 3,
        return_requested_quantity: 0,
        return_received_quantity: 0,
        return_dismissed_quantity: 0,
        written_off_quantity: 0,
      },
    ],
    shipping_methods: [
      {
        id: "ship_123",
        price: 0,
      },
    ],
    total: 270,
    shipping_total: 0,
  }

  it("should perform an item exchage", function () {
    const actions = [
      {
        action: ChangeActionType.RETURN_ITEM,
        reference_id: "return_123",
        details: {
          reference_id: "3",
          quantity: 1,
        },
      },
      {
        action: ChangeActionType.ITEM_ADD,
        reference_id: "item_555",
        details: {
          unit_price: 50,
          quantity: 1,
        },
      },
      {
        action: ChangeActionType.SHIPPING_ADD,
        reference_id: "shipping_345",
        amount: 5,
      },
      {
        action: ChangeActionType.SHIPPING_ADD,
        reference_id: "return_shipping_345",
        amount: 7.5,
      },
    ] as OrderChangeEvent[]

    const changes = calculateOrderChange({
      order: originalOrder,
      actions: actions,
    })

    expect(changes.summary).toEqual({
      transactionTotal: 0,
      originalOrderTotal: 270,
      currentOrderTotal: 312.5,
      temporaryDifference: 62.5,
      futureDifference: 0,
      futureTemporaryDifference: 0,
      pendingDifference: 312.5,
      differenceSum: 42.5,
    })

    expect(changes.order.items).toEqual([
      {
        id: "1",
        quantity: 1,
        unit_price: 10,
        fulfilled_quantity: 1,
        return_requested_quantity: 0,
        return_received_quantity: 0,
        return_dismissed_quantity: 0,
        written_off_quantity: 0,
      },
      {
        id: "2",
        quantity: 2,
        unit_price: 100,
        fulfilled_quantity: 1,
        return_requested_quantity: 0,
        return_received_quantity: 0,
        return_dismissed_quantity: 0,
        written_off_quantity: 0,
      },
      {
        id: "3",
        quantity: 3,
        unit_price: 20,
        fulfilled_quantity: 3,
        return_requested_quantity: 1,
        return_received_quantity: 0,
        return_dismissed_quantity: 0,
        written_off_quantity: 0,
      },
      {
        id: "item_555",
        unit_price: 50,
        quantity: 1,
      },
    ])
  })
})
