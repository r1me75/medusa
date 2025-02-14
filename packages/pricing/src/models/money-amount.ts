import { DALUtils, generateEntityId } from "@medusajs/utils"
import {
  BeforeCreate,
  Collection,
  Entity,
  Filter,
  Index,
  ManyToMany,
  ManyToOne,
  OneToOne,
  OnInit,
  OptionalProps,
  PrimaryKey,
  Property,
} from "@mikro-orm/core"

import { PriceSetMoneyAmount } from "./index"
import PriceSet from "./price-set"

@Entity()
@Filter(DALUtils.mikroOrmSoftDeletableFilterOptions)
class MoneyAmount {
  [OptionalProps]?:
    | "created_at"
    | "updated_at"
    | "deleted_at"
    | "price_set_money_amount"
    | "amount"

  @PrimaryKey({ columnType: "text" })
  id!: string

  @Property({ columnType: "text", nullable: true })
  currency_code: string | null

  @ManyToMany({
    entity: () => PriceSet,
    mappedBy: (ps) => ps.money_amounts,
  })
  price_sets = new Collection<PriceSet>(this)

  @OneToOne({
    entity: () => PriceSetMoneyAmount,
    mappedBy: (psma) => psma.money_amount,
    cascade: ["soft-remove"] as any,
  })
  price_set_money_amount: PriceSetMoneyAmount

  @Property({
    columnType: "numeric",
    nullable: true,
    serializer: Number,
  })
  amount: number | null

  @Property({ columnType: "numeric", nullable: true })
  min_quantity: number | null

  @Property({ columnType: "numeric", nullable: true })
  max_quantity: number | null

  @Property({
    onCreate: () => new Date(),
    columnType: "timestamptz",
    defaultRaw: "now()",
  })
  created_at: Date

  @Property({
    onCreate: () => new Date(),
    onUpdate: () => new Date(),
    columnType: "timestamptz",
    defaultRaw: "now()",
  })
  updated_at: Date

  @Index({ name: "IDX_money_amount_deleted_at" })
  @Property({ columnType: "timestamptz", nullable: true })
  deleted_at: Date | null

  @BeforeCreate()
  onCreate() {
    this.id = generateEntityId(this.id, "ma")
  }

  @OnInit()
  onInit() {
    this.id = generateEntityId(this.id, "ma")
  }
}

export default MoneyAmount
