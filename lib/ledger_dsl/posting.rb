# frozen_string_literal: true
# typed: strict

require 'sorbet-runtime'
require 'date'

require_relative 'status'
require_relative 'costed_amount'
require_relative 'comment'
require_relative 'date'

module LedgerDSL
  # Represents a posting in a financial transaction
  class Posting
    extend T::Sig

    sig do
      params(
        account: String,
        status: Status,
        amount: T.nilable(ToCostedAmount),
        balance: T.nilable(ToCostedAmount),
        comment: T.nilable(ToComment),
        date: T.nilable(ToDate),
        date2: T.nilable(ToDate),
        tags: String
      ).void
    end
    def initialize(
      account, status: Status::Unmarked, amount: nil, balance: nil,
      comment: nil, date: nil, date2: nil, **tags
    )
      @account = account
      @status = T.let(status, Status)
      @amount = T.let(amount && CostedAmount.from(amount), T.nilable(CostedAmount))
      @balance = T.let(balance && CostedAmount.from(balance), T.nilable(CostedAmount))
      @comment = T.let(comment && Comment.from(comment), T.nilable(Comment))
      @date = T.let(date && LedgerDSL.date_from(date), T.nilable(Date)) # Tag
      @date2 = T.let(date2 && LedgerDSL.date_from(date2), T.nilable(Date)) # Tag
      @tags = T.let(tags, T::Hash[Symbol, String])
    end

    sig { params(account: T.nilable(String)).returns(String) }
    def account(account = nil) = account.nil? ? @account : @account = account

    sig { params(status: T.nilable(Status)).returns(Status) }
    def status(status = nil) = status.nil? ? @status : @status = status

    sig { params(amount: T.nilable(ToCostedAmount)).returns(T.nilable(CostedAmount)) }
    def amount(amount = (reader = true; nil)) = reader ? @amount : @amount = amount && CostedAmount.from(amount)

    sig { params(balance: T.nilable(ToCostedAmount)).returns(T.nilable(CostedAmount)) }
    def balance(balance = (reader = true; nil)) = reader ? @balance : @balance = balance && CostedAmount.from(balance)

    sig { params(comment: T.nilable(ToComment)).returns(T.nilable(Comment)) }
    def comment(comment = (reader = true; nil)) = reader ? @comment : @comment = comment && Comment.from(comment)

    sig { params(date: T.nilable(ToDate)).returns(T.nilable(Date)) }
    def date(date = (reader = true; nil)) = reader ? @date : @date = date && LedgerDSL.date_from(date)

    sig { params(date2: T.nilable(ToDate)).returns(T.nilable(Date)) }
    def date2(date2 = (reader = true; nil)) = reader ? @date2 : @date2 = date2 && LedgerDSL.date_from(date2)

    sig { returns(T::Hash[Symbol, String]) }
    attr_reader :tags

    sig { params(indent: Integer).returns(String) }
    def to_ledger(indent)
      o = ' ' * indent
      o += '! ' if @status == Status::Pending
      o += '* ' if @status == Status::Cleared
      o += "#{@account} "
      o += " #{@amount.to_ledger}" if @amount
      o += " = #{@balance.to_ledger}" if @balance
      length = o.length + 1

      tags = @tags.dup
      tags[:date] = @date.to_s if @date
      tags[:date2] = @date2.to_s if @date2
      tags_str = tags.map { |k, v| "#{k}:#{v}" }.join(', ')
      o += " ; #{tags_str}" unless tags_str.empty?

      if @comment
        comment = @comment.to_ledger(length)
        o += if tags_str.empty?
               " #{comment.lstrip}"
             else
               "\n#{comment}"
             end
      end

      o
    end
  end
end
