import { CartDTO, UpdateCartWorkflowInputDTO } from "@medusajs/types"
import { PromotionActions, isPresent } from "@medusajs/utils"
import {
  WorkflowData,
  createWorkflow,
  parallelize,
  transform,
} from "@medusajs/workflows-sdk"
import {
  findOneOrAnyRegionStep,
  findOrCreateCustomerStep,
  findSalesChannelStep,
  retrieveCartStep,
  updateCartsStep,
} from "../steps"
import { refreshCartPromotionsStep } from "../steps/refresh-cart-promotions"

export const updateCartWorkflowId = "update-cart"
export const updateCartWorkflow = createWorkflow(
  updateCartWorkflowId,
  (input: WorkflowData<UpdateCartWorkflowInputDTO>): WorkflowData<CartDTO> => {
    const [salesChannel, region, customerData] = parallelize(
      findSalesChannelStep({
        salesChannelId: input.sales_channel_id,
      }),
      findOneOrAnyRegionStep({
        regionId: input.region_id,
      }),
      findOrCreateCustomerStep({
        customerId: input.customer_id,
        email: input.email,
      })
    )

    const cartInput = transform(
      { input, region, customerData, salesChannel },
      (data) => {
        const { promo_codes, ...updateCartData } = data.input
        const data_ = { ...updateCartData }

        if (isPresent(updateCartData.region_id)) {
          data_.currency_code = data.region.currency_code
          data_.region_id = data.region.id
        }

        if (
          updateCartData.customer_id !== undefined ||
          updateCartData.email !== undefined
        ) {
          data_.customer_id = data.customerData.customer?.id || null
          data_.email =
            data.input?.email ?? (data.customerData.customer?.email || null)
        }

        if (updateCartData.sales_channel_id !== undefined) {
          data_.sales_channel_id = data.salesChannel?.id || null
        }

        return data_
      }
    )

    updateCartsStep([cartInput])

    refreshCartPromotionsStep({
      id: input.id,
      promo_codes: input.promo_codes,
      action: PromotionActions.REPLACE,
    })

    const retrieveCartInput = {
      id: input.id,
      config: {
        relations: [
          "items",
          "items.adjustments",
          "shipping_methods",
          "shipping_methods.adjustments",
        ],
      },
    }

    return retrieveCartStep(retrieveCartInput)
  }
)
