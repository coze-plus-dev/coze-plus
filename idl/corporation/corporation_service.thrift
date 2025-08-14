include "./corporation.thrift"
 
namespace go corporation.corporation

service CorporationService {
    corporation.CreateCorpResponse CreateCorporation(1: corporation.CreateCorpRequest request)(api.post='/api/v1/corporation/create', api.category="corporation", api.gen_path= "corporation")
    corporation.GetCorpResponse GetCorporation(1: corporation.GetCorpRequest request)(api.get='/api/v1/corporation/:id', api.category="corporation", api.gen_path= "corporation")
    corporation.UpdateCorpResponse UpdateCorporation(1: corporation.UpdateCorpRequest request)(api.put='/api/v1/corporation/:id', api.category="corporation", api.gen_path= "corporation")
    corporation.DeleteCorpResponse DeleteCorporation(1: corporation.DeleteCorpRequest request)(api.delete='/api/v1/corporation/:id', api.category="corporation", api.gen_path= "corporation")
    corporation.ListCorpsResponse ListCorporations(1: corporation.ListCorpsRequest request)(api.post='/api/v1/corporation/list', api.category="corporation", api.gen_path= "corporation")
    corporation.GetOrganizationTreeResponse GetOrganizationTree(1: corporation.GetOrganizationTreeRequest request)(api.post='/api/v1/organization/tree', api.category="corporation", api.gen_path= "corporation")
}