# frozen_string_literal: true
# typed: strict

require 'sorbet-runtime'
require 'date'

require_relative 'status'
require_relative 'posting'
require_relative 'comment'
require_relative 'date'

# DSL for creating financial journals
module LedgerDSL
  # Represents a financial transaction
  class Transaction
    extend T::Sig

    sig do
      params(
        date: ToDate,
        status: Status,
        code: T.nilable(String),
        payee: T.nilable(String),
        note: T.nilable(String),
        tags: String
      ).void
    end
    def initialize(date, status: Status::Unmarked, code: nil, payee: nil, note: nil, **tags)
      @entries = T.let([], T::Array[T.any(Posting, Comment)])
      @date = T.let(LedgerDSL.date_from(date), Date)
      @status = T.let(status, Status)
      @code = T.let(code, T.nilable(String))
      @payee = T.let(payee, T.nilable(String))
      @note = T.let(note, T.nilable(String))
      @tags = T.let(tags, T::Hash[Symbol, String])
    end

    sig { params(date: T.nilable(ToDate)).returns(Date) }
    def date(date = nil) = date.nil? ? @date : @date = LedgerDSL.date_from(date)

    sig { params(status: T.nilable(Status)).returns(Status) }
    def status(status = nil) = status.nil? ? @status : @status = status

    sig { params(code: T.nilable(String)).returns(T.nilable(String)) }
    def code(code = (reader = true; nil)) = reader ? @code : @code = code

    sig { params(payee: T.nilable(String)).returns(T.nilable(String)) }
    def payee(payee = (reader = true; nil)) = reader ? @payee : @payee = payee

    sig { params(note: T.nilable(String)).returns(T.nilable(String)) }
    def note(note = (reader = true; nil)) = reader ? @note : @note = note

    sig { returns(T::Hash[Symbol, String]) }
    attr_reader :tags

    sig do
      params(
        account: String,
        status: Status,
        amount: T.nilable(ToCostedAmount),
        balance: T.nilable(ToCostedAmount),
        comment: T.nilable(ToComment),
        date: T.nilable(ToDate),
        date2: T.nilable(ToDate),
        tags: String,
        blk: T.nilable(T.proc.bind(Posting).params(p: Posting).void)
      ).returns(Posting)
    end
    def posting(
      account, status: Status::Unmarked, amount: nil, balance: nil,
      comment: nil, date: nil, date2: nil, **tags, &blk
    )
      posting = Posting.new(account, status: status, amount: amount, balance: balance, comment: comment, date: date,
                                     date2: date2, **tags)
      posting.instance_exec(posting, &blk) if block_given?
      @entries << posting
      posting
    end
    alias po posting

    # Create a new comment in the transaction
    sig { params(comment: ToComment).returns(Comment) }
    def comment(comment)
      comment = Comment.from(comment)
      @entries << Comment.from(comment)
      comment
    end
    alias co comment

    sig { params(_indent: Integer).returns(String) }
    def to_ledger(_indent = 0)
      o = @date.to_s
      o += ' !' if @status == Status::Pending
      o += ' *' if @status == Status::Cleared
      o += " (#{@code})" if @code
      o += " #{@payee}" if @payee
      o += " | #{@note}" if @note

      tags_str = @tags.map { |k, v| "#{k}:#{v}" }.join(', ')
      o += " ; #{tags_str}" unless tags_str.empty?

      o += "\n"
      o += @entries.map { |entry| entry.to_ledger(4) }.join("\n")

      o
    end
  end
end
