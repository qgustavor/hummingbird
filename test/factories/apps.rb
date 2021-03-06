# == Schema Information
#
# Table name: apps
#
#  id                :integer          not null, primary key
#  creator_id        :integer          not null
#  key               :string(255)      not null
#  secret            :string(255)      not null
#  name              :string(255)      not null
#  redirect_uri      :string(255)
#  homepage          :string(255)
#  description       :string(255)
#  privileged        :boolean          default(FALSE), not null
#  logo_file_name    :string(255)
#  logo_content_type :string(255)
#  logo_file_size    :integer
#  logo_updated_at   :datetime
#

FactoryGirl.define do
  factory :app do
    name { Faker::App.name }
    key { SecureRandom.hex(10) }
    secret { SecureRandom.base64(30) }
  end
end
