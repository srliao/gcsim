package db

import (
	"google.golang.org/protobuf/encoding/protojson"
)

func marshalOptions() protojson.MarshalOptions {
	return protojson.MarshalOptions{
		AllowPartial:    true,
		UseEnumNumbers:  true, // TODO: prob better if we set to false?
		EmitUnpopulated: false,
	}
}
func unmarshalOptions() protojson.UnmarshalOptions {
	return protojson.UnmarshalOptions{
		AllowPartial:   true,
		DiscardUnknown: true,
	}
}

func (r *CompleteWorkRequest) MarshalJSON() ([]byte, error) {
	return marshalOptions().Marshal(r)
}

func (r *CompleteWorkRequest) UnmarshalJSON(b []byte) error {
	return unmarshalOptions().Unmarshal(b, r)
}

func (r *RejectWorkRequest) MarshalJSON() ([]byte, error) {
	return marshalOptions().Marshal(r)
}

func (r *RejectWorkRequest) UnmarshalJSON(b []byte) error {
	return unmarshalOptions().Unmarshal(b, r)
}
